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

console.log(`Fixing brace issues in ${filesToFix.length} files...`);

for (const filePath of filesToFix) {
  try {
    console.log(`Processing ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the main pattern: coordinates line should end with just }
    // Then the next line should be }, or ] for the last station
    
    // Pattern 1: coordinates: { lat: X, lng: Y },
    // Should be: coordinates: { lat: X, lng: Y }
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \},/g,
      'coordinates: { lat: $1, lng: $2 }'
    );
    
    // Pattern 2: After fixing coordinates, we need to add } on the next line
    // Look for: coordinates: { lat: X, lng: Y }\n    {
    // Should be: coordinates: { lat: X, lng: Y }\n    },\n    {
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \}\s*\n\s*\{/g,
      'coordinates: { lat: $1, lng: $2 }\n    },\n    {'
    );
    
    // Pattern 3: Handle the last station in the array
    // coordinates: { lat: X, lng: Y }\n  ]
    // Should be: coordinates: { lat: X, lng: Y }\n    }\n  ]
    content = content.replace(
      /coordinates: \{ lat: ([^,]+), lng: ([^}]+) \}\s*\n\s*\]/g,
      'coordinates: { lat: $1, lng: $2 }\n    }\n  ]'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Processed ${filePath}`);
    
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n🎉 All files processed!`);
