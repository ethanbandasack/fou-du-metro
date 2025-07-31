const fs = require('fs');
const path = require('path');

console.log('Fixing metro/tram connection issues...');

// Step 1: Fix tram line names in tram files (add T prefix)
const tramFiles = [
  'tram-1.ts', 'tram-2.ts', 'tram-3A.ts', 'tram-3B.ts', 'tram-4.ts',
  'tram-5.ts', 'tram-6.ts', 'tram-7.ts', 'tram-8.ts', 'tram-9.ts',
  'tram-10.ts', 'tram-11.ts', 'tram-12.ts', 'tram-13.ts', 'tram-14.ts'
];

tramFiles.forEach(filename => {
  const filePath = path.join('src/data/lines', filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`Fixing tram line name in ${filename}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract the original line number/name
    const lineMatch = content.match(/line:\s*"([^"]+)"/);
    if (lineMatch) {
      const originalLine = lineMatch[1];
      const newLine = originalLine.startsWith('T') ? originalLine : `T${originalLine}`;
      
      // Replace line name
      content = content.replace(
        /line:\s*"[^"]+"/,
        `line: "${newLine}"`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`  Updated line name from "${originalLine}" to "${newLine}"`);
    }
  }
});

// Step 2: Fix connections in all files
const allFiles = fs.readdirSync('src/data/lines').filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts');

// Create mapping of what tram lines should be called
const tramLineMapping = {
  '1': 'T1', '2': 'T2', '3A': 'T3A', '3B': 'T3B', '4': 'T4',
  '5': 'T5', '6': 'T6', '7': 'T7', '8': 'T8', '9': 'T9',
  '10': 'T10', '11': 'T11', '12': 'T12', '13': 'T13', '14': 'T14'
};

allFiles.forEach(filename => {
  const filePath = path.join('src/data/lines', filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix connections arrays
  const connectionRegex = /connections:\s*\[(.*?)\]/g;
  content = content.replace(connectionRegex, (match, connectionsStr) => {
    // Parse the connections
    const connections = connectionsStr.split(',').map(c => c.trim().replace(/"/g, ''));
    
    const fixedConnections = connections.map(conn => {
      if (conn === '') return conn;
      
      // If it's a number that should be a tram, add T prefix
      if (tramLineMapping[conn] && !conn.startsWith('T')) {
        changed = true;
        return tramLineMapping[conn];
      }
      
      return conn;
    });
    
    // Rebuild the connections array string
    const fixedStr = fixedConnections.filter(c => c !== '').map(c => `"${c}"`).join(', ');
    return `connections: [${fixedStr}]`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed connections in ${filename}`);
  }
});

console.log('✅ All metro/tram connection issues fixed!');
