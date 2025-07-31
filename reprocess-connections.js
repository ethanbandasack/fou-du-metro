const fs = require('fs');
const path = require('path');

console.log('Reprocessing connections based on actual station data...');
console.log('CONSERVATIVE MODE: Only swapping metro/tram connections, not removing any');

// First, read all station data from all line files
const linesDir = 'src/data/lines';
const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts');

// Map to store all stations: stationName -> [list of lines it appears on]
const stationToLines = new Map();
// Map to store what line types exist: lineName -> mode
const lineToMode = new Map();

console.log('Step 1: Reading all station data...');

files.forEach(file => {
  const filePath = path.join(linesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract line name and mode
  const lineMatch = content.match(/line:\s*"([^"]+)"/);
  const modeMatch = content.match(/mode:\s*"([^"]+)"/);
  
  if (!lineMatch || !modeMatch) {
    console.log(`Skipping ${file} - no line/mode found`);
    return;
  }
  
  const lineName = lineMatch[1];
  const mode = modeMatch[1];
  
  console.log(`Processing ${file}: ${mode} ${lineName}`);
  
  // Store line type info
  lineToMode.set(lineName, mode);
  
  // Extract station names
  const stationMatches = content.matchAll(/name:\s*"([^"]+)"/g);
  const stations = [];
  
  for (const match of stationMatches) {
    const stationName = match[1];
    stations.push(stationName);
    
    // Normalize station name for comparison (remove accents, lowercase, etc.)
    const normalizedName = stationName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!stationToLines.has(normalizedName)) {
      stationToLines.set(normalizedName, []);
    }
    
    stationToLines.get(normalizedName).push({
      lineName,
      mode,
      originalName: stationName
    });
  }
});

console.log(`\nStep 2: Found ${stationToLines.size} unique station names`);

// Find stations that appear on multiple lines
const multiLineStations = new Map();
stationToLines.forEach((lines, normalizedName) => {
  if (lines.length > 1) {
    multiLineStations.set(normalizedName, lines);
  }
});

console.log(`Found ${multiLineStations.size} stations that appear on multiple lines`);

// Debug: show some multi-line stations
console.log('\nExamples of multi-line stations:');
let count = 0;
multiLineStations.forEach((lines, stationName) => {
  if (count < 5) {
    const lineNames = lines.map(l => `${l.mode} ${l.lineName}`).join(', ');
    console.log(`  "${lines[0].originalName}" appears on: ${lineNames}`);
    count++;
  }
});

console.log('\nStep 3: Fixing metro/tram connection swaps only...');

// Helper function to check if a connection should be metro or tram
const getCorrectConnectionType = (connectionLine, stationName, currentLineName) => {
  // Normalize the station name
  const normalizedName = stationName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Find what lines this station appears on
  const stationLines = stationToLines.get(normalizedName) || [];
  
  // Check if the connection exists
  const connectionExists = stationLines.some(lineInfo => 
    lineInfo.lineName === connectionLine && lineInfo.lineName !== currentLineName
  );
  
  if (connectionExists) {
    const mode = lineToMode.get(connectionLine);
    return { exists: true, mode, line: connectionLine };
  }
  
  // Check if we need to swap metro/tram
  if (/^[0-9]+$/.test(connectionLine)) {
    // This is a pure number - could be wrong metro, should be tram?
    const tramVersion = `T${connectionLine}`;
    const tramExists = stationLines.some(lineInfo => 
      lineInfo.lineName === tramVersion && lineInfo.lineName !== currentLineName
    );
    if (tramExists) {
      return { exists: true, mode: 'TRAMWAY', line: tramVersion, wasSwapped: true };
    }
  } else if (connectionLine.startsWith('T') && /^T[0-9]+/.test(connectionLine)) {
    // This is a tram line - could be wrong tram, should be metro?
    const metroVersion = connectionLine.substring(1);
    const metroExists = stationLines.some(lineInfo => 
      lineInfo.lineName === metroVersion && lineInfo.lineName !== currentLineName
    );
    if (metroExists) {
      return { exists: true, mode: 'METRO', line: metroVersion, wasSwapped: true };
    }
  }
  
  return { exists: false, line: connectionLine };
};

// Now update each file with proper connections
files.forEach(file => {
  const filePath = path.join(linesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Get the line info for this file
  const lineMatch = content.match(/line:\s*"([^"]+)"/);
  if (!lineMatch) return;
  
  const currentLineName = lineMatch[1];
  console.log(`\nFixing connections for ${currentLineName}...`);
  
  // Replace each station's connections
  content = content.replace(
    /{\s*order:\s*\d+,\s*name:\s*"([^"]+)"[\s\S]*?connections:\s*\[([^\]]*)\]/g,
    (match, stationName, currentConnections) => {
      // Parse existing connections
      const existingConnections = currentConnections
        .split(',')
        .map(c => c.trim().replace(/"/g, ''))
        .filter(c => c !== '');
      
      // Fix each connection
      const fixedConnections = existingConnections.map(conn => {
        const result = getCorrectConnectionType(conn, stationName, currentLineName);
        if (result.wasSwapped) {
          console.log(`  ${stationName}: ${conn} -> ${result.line} (${result.mode})`);
          hasChanges = true;
        }
        return result.line;
      });
      
      const connectionsStr = fixedConnections.map(c => `"${c}"`).join(', ');
      const newConnectionsStr = `connections: [${connectionsStr}]`;
      
      return match.replace(/connections:\s*\[[^\]]*\]/, newConnectionsStr);
    }
  );
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated ${file}`);
  } else {
    console.log(`  ℹ️  No swaps needed for ${file}`);
  }
});

console.log('\n🎉 Metro/Tram connection fixing completed!');
