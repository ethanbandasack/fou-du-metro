#!/bin/bash

# Script to fix missing closing braces in all transportation line files
# This will fix the common pattern where station objects are missing closing braces

cd /home/pseudo/Documents/metro/fou-du-metro

# List of files that need fixing (based on TypeScript error output)
files_to_fix=(
  "src/data/lines/metro-10.ts"
  "src/data/lines/metro-11.ts"
  "src/data/lines/metro-12.ts"
  "src/data/lines/metro-13.ts"
  "src/data/lines/metro-2.ts"
  "src/data/lines/metro-3.ts"
  "src/data/lines/metro-3bis.ts"
  "src/data/lines/metro-4.ts"
  "src/data/lines/metro-5.ts"
  "src/data/lines/metro-6.ts"
  "src/data/lines/metro-7.ts"
  "src/data/lines/metro-7bis.ts"
  "src/data/lines/metro-8.ts"
  "src/data/lines/metro-9.ts"
  "src/data/lines/rer-a.ts"
  "src/data/lines/rer-b.ts"
  "src/data/lines/rer-c.ts"
  "src/data/lines/rer-d.ts"
  "src/data/lines/rer-e.ts"
)

echo "Fixing brace issues in ${#files_to_fix[@]} files..."

for file in "${files_to_fix[@]}"; do
  echo "Processing $file"
  
  # Create a backup
  cp "$file" "$file.backup"
  
  # Fix the common pattern: coordinates: { lat: X, lng: Y },
  # Should be: coordinates: { lat: X, lng: Y }
  # followed by: }
  sed -i 's/coordinates: { lat: \([^,]*\), lng: \([^}]*\) },/coordinates: { lat: \1, lng: \2 }\n    },/g' "$file"
  
  # Check if the fix worked
  if npx tsc --noEmit "$file" 2>/dev/null; then
    echo "✅ Fixed $file"
    rm "$file.backup"
  else
    echo "❌ Failed to fix $file, restoring backup"
    mv "$file.backup" "$file"
  fi
done

echo "Done!"
