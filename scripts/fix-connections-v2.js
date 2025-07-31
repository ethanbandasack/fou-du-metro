const fs = require('fs');
const path = require('path');

console.log('Fixing incorrect metro/tram connections...');

// First, get a mapping of actual line names by reading all files
const linesDir = 'src/data/lines';
const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts');

const actualLines = new Set();
files.forEach(file => {
  const content = fs.readFileSync(path.join(linesDir, file), 'utf8');
  const lineMatch = content.match(/line:\s*"([^"]+)"/);
  if (lineMatch) {
    actualLines.add(lineMatch[1]);
  }
});

console.log('Actual line names found:', Array.from(actualLines).sort());

// Now fix connections in all files
files.forEach(filename => {
  const filePath = path.join(linesDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Fix connections arrays
  content = content.replace(/connections:\s*\[(.*?)\]/g, (match, connectionsStr) => {
    const connections = connectionsStr.split(',').map(c => c.trim().replace(/"/g, ''));
    
    const fixedConnections = connections.map(conn => {
      if (conn === '') return conn;
      
      // Fix incorrect tram prefixes on metro lines
      if (conn.startsWith('T') && conn.length <= 3) {
        const number = conn.substring(1);
        // If this should be a metro line (single digit or 10-14)
        if (/^[1-9]$/.test(number) || /^1[0-4]$/.test(number)) {
          // Check if there's actually a metro line with this number
          if (actualLines.has(number)) {
            console.log(`  Fixing ${conn} -> ${number} in ${filename}`);
            changed = true;
            return number;
          }
        }
      }
      
      return conn;
    });
    
    const fixedStr = fixedConnections.filter(c => c !== '').map(c => `"${c}"`).join(', ');
    return `connections: [${fixedStr}]`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed connections in ${filename}`);
  }
});

console.log('✅ Connection fixes completed!');
