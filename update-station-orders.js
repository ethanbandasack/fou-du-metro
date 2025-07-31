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
      lineOrders[fileName] = stations;
    }
  }
});

console.log('Found orders for', Object.keys(lineOrders).length, 'lines');

// Update each line file
const linesDir = './src/data/lines';
const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

let updatedFiles = 0;

files.forEach(file => {
  if (lineOrders[file]) {
    const filePath = path.join(linesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Extract current stations with proper parsing
    const stationsMatch = content.match(/stations:\s*\[([\s\S]*)\]/);
    if (stationsMatch) {
      const stationsContent = stationsMatch[1];
      
      console.log(`Stations content length: ${stationsContent.length}`);
      console.log(`First 200 chars of stations content:\n${stationsContent.substring(0, 200)}`);
      console.log(`Last 200 chars of stations content:\n${stationsContent.substring(Math.max(0, stationsContent.length - 200))}`);
      
      // Split by objects using a more robust approach
      // Look for patterns like "}, {" or "} ]" to identify object boundaries
      const objectPattern = /\{[\s\S]*?\}/g;
      const stationObjects = stationsContent.match(objectPattern) || [];
      
      console.log(`Found ${stationObjects.length} station objects using regex pattern`);
      
      // Create a map of normalized station name to full object
      const stationMap = {};
      stationObjects.forEach(obj => {
        const nameMatch = obj.match(/name:\s*["'`]([^"'`]+)["'`]/);
        if (nameMatch) {
          const stationName = nameMatch[1];
          const normalizedName = normalizeStationName(stationName);
          stationMap[normalizedName] = obj;
        }
      });
      
      console.log(`\n=== Processing ${file} ===`);
      console.log(`Found ${stationObjects.length} stations in file`);
      
      // Reorder stations according to order.md
      const orderedStations = [];
      const correctOrder = lineOrders[file];
      const usedStations = new Set();
      
      correctOrder.forEach((targetStationName, index) => {
        const bestMatch = findBestStationMatch(targetStationName, stationMap);
        
        if (bestMatch && !usedStations.has(bestMatch)) {
          // Update the order index in the station object
          let stationObj = bestMatch.replace(/order:\s*\d+/, `order: ${index + 1}`);
          orderedStations.push(stationObj);
          usedStations.add(bestMatch);
          console.log(`✓ ${index + 1}. "${targetStationName}" → matched`);
        } else {
          console.log(`✗ ${index + 1}. "${targetStationName}" → NOT FOUND`);
        }
      });
      
      // Add any remaining stations that weren't in order.md at the end
      Object.values(stationMap).forEach(obj => {
        if (!usedStations.has(obj)) {
          let stationObj = obj.replace(/order:\s*\d+/, `order: ${orderedStations.length + 1}`);
          orderedStations.push(stationObj);
          const nameMatch = obj.match(/name:\s*["'`]([^"'`]+)["'`]/);
          const stationName = nameMatch ? nameMatch[1] : 'Unknown';
          console.log(`+ Added remaining station: "${stationName}"`);
        }
      });
      
      if (orderedStations.length > 0) {
        const newStationsContent = orderedStations.join(',\n    ');
        const newContent = content.replace(
          /stations:\s*\[\s*[\s\S]*?\s*\]/,
          `stations: [\n    ${newStationsContent}\n  ]`
        );
        
        fs.writeFileSync(filePath, newContent);
        updatedFiles++;
        console.log(`Updated ${file} with ${orderedStations.length} stations (${orderedStations.length - usedStations.size} unmatched)`);
      }
    }
  }
});

console.log(`\n✅ Updated ${updatedFiles} files with correct station orders`);
