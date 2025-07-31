const fs = require('fs');
const path = require('path');

// Function to normalize station names for comparison
function normalizeStationName(name) {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ÿý]/g, 'y')
    .replace(/[\s\-–—''`]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to find best station match with fuzzy matching
function findBestStationMatch(targetName, stationMap) {
  const normalizedTarget = normalizeStationName(targetName);
  
  // First try exact match
  for (const [normalizedName, obj] of Object.entries(stationMap)) {
    if (normalizedName === normalizedTarget) {
      return obj;
    }
  }
  
  // Try partial matches - check if target is contained in any station name
  for (const [normalizedName, obj] of Object.entries(stationMap)) {
    if (normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)) {
      return obj;
    }
  }
  
  // Try key word matching
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [normalizedName, obj] of Object.entries(stationMap)) {
    const nameWords = normalizedName.split(' ').filter(w => w.length > 2);
    let score = 0;
    
    for (const targetWord of targetWords) {
      for (const nameWord of nameWords) {
        if (targetWord === nameWord) {
          score += 2;
        } else if (nameWord.includes(targetWord) || targetWord.includes(nameWord)) {
          score += 1;
        }
      }
    }
    
    if (score > bestScore && score >= targetWords.length) {
      bestScore = score;
      bestMatch = obj;
    }
  }
  
  return bestMatch;
}

// Read the order.md file
const orderContent = fs.readFileSync('./src/data/order.md', 'utf8');

// Parse the order.md file to extract station orders for each line
const lineOrders = {};
const lines = orderContent.split(/^# /m).filter(line => line.trim());

lines.forEach(lineSection => {
  const lineMatch = lineSection.match(/^([^\n]+)\n([\s\S]*)/);
  if (lineMatch) {
    const lineName = lineMatch[1].trim();
    const stationsText = lineMatch[2].trim();
    const stations = stationsText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    
    // Map line names to file names
    let fileName = '';
    if (lineName.startsWith('Métro ')) {
      const metroNum = lineName.replace('Métro ', '');
      fileName = `metro-${metroNum}.ts`;
    } else if (lineName.startsWith('RER ')) {
      const rerLetter = lineName.replace('RER ', '').toLowerCase();
      fileName = `rer-${rerLetter}.ts`;
    } else if (lineName.startsWith('Tram ')) {
      const tramNum = lineName.replace('Tram ', '');
      fileName = `tram-${tramNum}.ts`;
    } else if (lineName.startsWith('Train ')) {
      const trainLetter = lineName.replace('Train ', '').toLowerCase();
      fileName = `train-${trainLetter}.ts`;
    }
    
    if (fileName) {
      lineOrders[fileName] = {
        lineName: lineName,
        stations: stations
      };
    }
  }
});

console.log('Found orders for', Object.keys(lineOrders).length, 'lines');

// Collect all unmatched stations
const unmatchedStations = [];
const linesDir = './src/data/lines';
const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

files.forEach(file => {
  if (lineOrders[file]) {
    const filePath = path.join(linesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract current stations
    const stationsMatch = content.match(/stations:\s*\[([\s\S]*)\]/);
    if (stationsMatch) {
      const stationsContent = stationsMatch[1];
      
      // Split by objects using regex
      const objectPattern = /\{[\s\S]*?\}/g;
      const stationObjects = stationsContent.match(objectPattern) || [];
      
      // Create a map of normalized station name to full object
      const stationMap = {};
      stationObjects.forEach(obj => {
        const nameMatch = obj.match(/name:\s*["'`]([^"'`]+)["'`]/);
        if (nameMatch) {
          const stationName = nameMatch[1];
          const normalizedName = normalizeStationName(stationName);
          stationMap[normalizedName] = {
            originalName: stationName,
            object: obj
          };
        }
      });
      
      console.log(`\n=== Processing ${file} (${lineOrders[file].lineName}) ===`);
      console.log(`Found ${stationObjects.length} stations in file`);
      
      // Check for unmatched stations from order.md
      const correctOrder = lineOrders[file].stations;
      const usedStations = new Set();
      
      correctOrder.forEach((targetStationName, index) => {
        const bestMatch = findBestStationMatch(targetStationName, stationMap);
        
        if (!bestMatch || usedStations.has(bestMatch.originalName)) {
          unmatchedStations.push({
            line: lineOrders[file].lineName,
            fileName: file,
            expectedName: targetStationName,
            position: index + 1,
            reason: !bestMatch ? 'NOT_FOUND' : 'ALREADY_USED'
          });
          console.log(`✗ ${index + 1}. "${targetStationName}" → ${!bestMatch ? 'NOT FOUND' : 'ALREADY USED'}`);
        } else {
          usedStations.add(bestMatch.originalName);
          console.log(`✓ ${index + 1}. "${targetStationName}" → matched with "${bestMatch.originalName}"`);
        }
      });
      
      // Check for stations in file that weren't matched to any from order.md
      Object.values(stationMap).forEach(stationInfo => {
        if (!usedStations.has(stationInfo.originalName)) {
          unmatchedStations.push({
            line: lineOrders[file].lineName,
            fileName: file,
            actualName: stationInfo.originalName,
            expectedName: null,
            position: null,
            reason: 'EXTRA_IN_FILE'
          });
          console.log(`+ Extra station in file: "${stationInfo.originalName}"`);
        }
      });
    }
  }
});

// Generate report
let report = `# Unmatched Stations Report\n`;
report += `Generated on: ${new Date().toISOString()}\n\n`;

if (unmatchedStations.length === 0) {
  report += `✅ All stations matched successfully!\n`;
} else {
  report += `Found ${unmatchedStations.length} unmatched stations:\n\n`;
  
  // Group by line
  const groupedByLine = {};
  unmatchedStations.forEach(station => {
    if (!groupedByLine[station.line]) {
      groupedByLine[station.line] = [];
    }
    groupedByLine[station.line].push(station);
  });
  
  Object.keys(groupedByLine).sort().forEach(lineName => {
    report += `## ${lineName} (${groupedByLine[lineName][0].fileName})\n\n`;
    
    groupedByLine[lineName].forEach(station => {
      if (station.reason === 'NOT_FOUND') {
        report += `- ❌ **Missing**: "${station.expectedName}" (position ${station.position}) - not found in file\n`;
      } else if (station.reason === 'ALREADY_USED') {
        report += `- ⚠️ **Duplicate**: "${station.expectedName}" (position ${station.position}) - multiple matches\n`;
      } else if (station.reason === 'EXTRA_IN_FILE') {
        report += `- ➕ **Extra**: "${station.actualName}" - exists in file but not in order.md\n`;
      }
    });
    
    report += `\n`;
  });
  
  // Summary by reason
  report += `## Summary by Issue Type\n\n`;
  const reasonCounts = {};
  unmatchedStations.forEach(station => {
    reasonCounts[station.reason] = (reasonCounts[station.reason] || 0) + 1;
  });
  
  Object.entries(reasonCounts).forEach(([reason, count]) => {
    const label = {
      'NOT_FOUND': 'Missing stations',
      'ALREADY_USED': 'Duplicate matches', 
      'EXTRA_IN_FILE': 'Extra stations in files'
    }[reason] || reason;
    report += `- **${label}**: ${count}\n`;
  });
}

// Write report to file
fs.writeFileSync('./unmatched-stations-report.md', report);

console.log(`\n📊 Report generated: unmatched-stations-report.md`);
console.log(`Total unmatched stations: ${unmatchedStations.length}`);
