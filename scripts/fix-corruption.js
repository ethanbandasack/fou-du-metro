const fs = require('fs');

const filesToFix = [
  'src/data/lines/metro-10.ts',
  'src/data/lines/metro-11.ts',
  'src/data/lines/metro-12.ts',
  'src/data/lines/metro-13.ts',
  'src/data/lines/metro-2.ts',
  'src/data/lines/metro-3.ts',
  'src/data/lines/metro-3bis.ts',
  'src/data/lines/metro-4.ts',
  'src/data/lines/metro-5.ts',
  'src/data/lines/metro-6.ts',
  'src/data/lines/metro-7.ts',
  'src/data/lines/metro-7bis.ts',
  'src/data/lines/metro-8.ts',
  'src/data/lines/metro-9.ts',
  'src/data/lines/rer-a.ts',
  'src/data/lines/rer-b.ts',
  'src/data/lines/rer-c.ts',
  'src/data/lines/rer-d.ts',
  'src/data/lines/rer-e.ts'
];

console.log(`Fixing corrupted file structures in ${filesToFix.length} files...`);

for (const filePath of filesToFix) {
  try {
    console.log(`Processing ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the pattern where the stations array ends incorrectly
    // Look for: }  ],  followed by coordinates: { lat:
    // This indicates corruption where there's a premature array close
    
    // Step 1: Find the corruption point
    const corruptionPattern = /(\s*}\s*\]\s*,?\s*coordinates:\s*\{[^}]+\})/;
    const match = content.match(corruptionPattern);
    
    if (match) {
      console.log(`  Found corruption in ${filePath}`);
      
      // Find the proper end of the last valid station
      // Look backwards from the corruption point to find the last complete station
      const beforeCorruption = content.substring(0, match.index);
      
      // The corruption starts with "}  ]," - we need to replace this with proper closure
      const afterCorruption = content.substring(match.index + match[0].length);
      
      // Find the proper end of stations array by looking for the pattern that should close it
      // We need to find where the real stations array should end
      let fixed = beforeCorruption;
      
      // Remove the "}  ]," part and ensure proper closure
      if (fixed.trim().endsWith('}')) {
        fixed += '\n  ]\n};\n';
      } else if (fixed.trim().endsWith('},')) {
        // Remove the trailing comma and add proper closure
        fixed = fixed.replace(/,\s*$/, '\n    }\n  ]\n};\n');
      }
      
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✅ Fixed corruption in ${filePath}`);
    } else {
      console.log(`  ⚠️  No corruption pattern found in ${filePath}`);
    }
    
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 All files processed!`);
