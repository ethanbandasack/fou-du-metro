const fs = require('fs');
const path = require('path');

// Files that need fixing based on TypeScript errors
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

console.log(`Fixing brace issues in ${filesToFix.length} files...`);

let fixedCount = 0;
let failedFiles = [];

for (const filePath of filesToFix) {
  try {
    console.log(`Processing ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the pattern: coordinates: { lat: X, lng: Y },
    // Should be: coordinates: { lat: X, lng: Y }\n    },
    
    // This regex finds lines that end with coordinates and a comma but are missing the closing brace
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \},\s*\n\s*\{/g,
      'coordinates: { lat: $1, lng: $2 }\n    },\n    {'
    );
    
    // Also fix any trailing coordinates that don't have a closing brace
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \},\s*$/gm,
      'coordinates: { lat: $1, lng: $2 }\n    }'
    );
    
    // Fix cases where there's a coordinates line followed by a new station object
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \},(\s*\n\s*\{)/g,
      'coordinates: { lat: $1, lng: $2 }\n    },$3'
    );
    
    // Write the fixed content
    fs.writeFileSync(filePath, content);
    
    // Verify the fix by checking TypeScript compilation
    const { execSync } = require('child_process');
    try {
      execSync(`npx tsc --noEmit "${filePath}"`, { stdio: 'pipe' });
      console.log(`✅ Fixed ${filePath}`);
      fixedCount++;
    } catch (error) {
      console.log(`❌ Fix failed for ${filePath} - TypeScript errors remain`);
      failedFiles.push(filePath);
    }
    
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
    failedFiles.push(filePath);
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Successfully fixed: ${fixedCount} files`);
console.log(`❌ Failed to fix: ${failedFiles.length} files`);

if (failedFiles.length > 0) {
  console.log(`\nFailed files:`);
  failedFiles.forEach(file => console.log(`  - ${file}`));
}

console.log(`\n🎉 Process complete!`);
