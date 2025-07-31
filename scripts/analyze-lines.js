const fs = require('fs');
const path = require('path');

// First, let's examine what tram and metro line names are actually used
function analyzeLinesData() {
  const linesDir = 'src/data/lines';
  const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts');
  
  const metroLines = new Set();
  const tramLines = new Set();
  const rerLines = new Set();
  const trainLines = new Set();
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(linesDir, file), 'utf8');
    
    // Extract line name and mode
    const lineMatch = content.match(/line:\s*"([^"]+)"/);
    const modeMatch = content.match(/mode:\s*"([^"]+)"/);
    
    if (lineMatch && modeMatch) {
      const lineName = lineMatch[1];
      const mode = modeMatch[1];
      
      switch(mode) {
        case 'METRO':
          metroLines.add(lineName);
          break;
        case 'TRAMWAY':
          tramLines.add(lineName);
          break;
        case 'RER':
          rerLines.add(lineName);
          break;
        case 'TRANSILIEN':
          trainLines.add(lineName);
          break;
      }
    }
  });
  
  console.log('Metro lines:', Array.from(metroLines).sort());
  console.log('Tram lines:', Array.from(tramLines).sort());
  console.log('RER lines:', Array.from(rerLines).sort());
  console.log('Train lines:', Array.from(trainLines).sort());
  
  return { metroLines, tramLines, rerLines, trainLines };
}

const lineData = analyzeLinesData();
