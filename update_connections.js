#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read CSV and parse station connections
function parseCSVConnections() {
  const csvPath = path.join(__dirname, 'src/data/emplacement-des-gares-idf.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // Map: station name -> array of lines it appears on
  const stationToLines = new Map();
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(';');
    if (fields.length >= 15) {
      const nom_long = fields[3];
      const indice_lig = fields[13];
      const mode = fields[14];
      
      if (['METRO', 'RER', 'TRAIN', 'TRAMWAY', 'VAL'].includes(mode)) {
        // Normalize station name for matching
        const normalizedName = nom_long.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]/g, ''); // Remove special chars and spaces
        
        if (!stationToLines.has(normalizedName)) {
          stationToLines.set(normalizedName, []);
        }
        
        // Format line name based on mode
        let lineName = indice_lig;
        if (mode === 'TRAMWAY') {
          lineName = `T${indice_lig}`;
        }
        
        const existingLines = stationToLines.get(normalizedName);
        if (!existingLines.some(l => l.line === lineName)) {
          existingLines.push({ line: lineName, mode, originalName: nom_long });
        }
      }
    }
  }
  
  return stationToLines;
}

// Update connections in a TypeScript file
function updateConnectionsInFile(filePath, stationToLines) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;
  
  // Extract current line info from file
  const match = content.match(/line: "([^"]+)"/);
  if (!match) return false;
  
  const currentLine = match[1];
  
  // Find all station entries and update their connections
  content = content.replace(
    /{\s*order: \d+,\s*name: "([^"]+)",[\s\S]*?connections: \[[^\]]*\]/g,
    (match, stationName) => {
      // Normalize station name for lookup
      const normalizedName = stationName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
      
      const stationLines = stationToLines.get(normalizedName) || [];
      
      // Get connections (other lines at this station, excluding current line)
      const connections = stationLines
        .filter(l => l.line !== currentLine && l.line !== `T${currentLine}`)
        .map(l => l.line)
        .filter((line, index, arr) => arr.indexOf(line) === index) // Remove duplicates
        .sort();
      
      const connectionsStr = connections.length > 0 
        ? `["${connections.join('", "')}"]`
        : '[]';
      
      const updatedMatch = match.replace(
        /connections: \[[^\]]*\]/,
        `connections: ${connectionsStr}`
      );
      
      if (updatedMatch !== match) {
        updated = true;
        console.log(`  Updated ${stationName}: [${connections.join(', ')}]`);
      }
      
      return updatedMatch;
    }
  );
  
  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Updated ${path.basename(filePath)}`);
  } else {
    console.log(`  ⏩ No changes needed for ${path.basename(filePath)}`);
  }
  
  return updated;
}

// Main function
function main() {
  console.log('🚇 Populating connections in line data files...\n');
  
  // Parse connections from CSV
  console.log('📊 Parsing station connections from CSV...');
  const stationToLines = parseCSVConnections();
  console.log(`Found ${stationToLines.size} unique stations\n`);
  
  // Update all TypeScript files in the lines directory
  const linesDir = path.join(__dirname, 'src/data/lines');
  const files = fs.readdirSync(linesDir)
    .filter(file => file.endsWith('.ts') && !['types.ts', 'index.ts'].includes(file))
    .map(file => path.join(linesDir, file));
  
  let totalUpdated = 0;
  for (const file of files) {
    if (updateConnectionsInFile(file, stationToLines)) {
      totalUpdated++;
    }
  }
  
  console.log(`\n✅ Done! Updated ${totalUpdated} files.`);
}

main();
