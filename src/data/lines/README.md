# Line Data Management

## Overview
This directory contains individual line data files that provide precise station ordering and metadata for each metro/RER/train line. This system allows for manual control over station order and better performance compared to CSV parsing.

## File Structure
```
src/data/lines/
├── types.ts           # TypeScript interfaces
├── index.ts           # Main export and utility functions  
├── metro-1.ts         # Metro Line 1 data
├── metro-2.ts         # Metro Line 2 data (to be created)
├── rer-a.ts           # RER A data (to be created)
└── README.md          # This file
```

## Creating a New Line File

### 1. Extract stations from CSV
```bash
# Get all stations for a specific line (example: Metro Line 2)
grep "METRO 2;" src/data/emplacement-des-gares-idf.csv

# Get all RER A stations
grep "RER A;" src/data/emplacement-des-gares-idf.csv
```

### 2. Create the line file
Copy the template below and replace with your line data:

```typescript
import { MetroLineData } from './types';

export const metroLine2: MetroLineData = {
  line: "2",
  mode: "METRO",
  color: "#0055C8", // Line color
  stations: [
    {
      order: 1,
      name: "Porte Dauphine",
      connections: [], // Other lines that connect here
      coordinates: { lat: 48.xxxxx, lng: 2.xxxxx }
    },
    {
      order: 2,
      name: "Victor Hugo",
      connections: [],
      coordinates: { lat: 48.xxxxx, lng: 2.xxxxx }
    },
    // ... continue with all stations in order
  ]
};
```

### 3. Add to index.ts
Import your new line in `index.ts`:

```typescript
import { metroLine2 } from './metro-2';

const ALL_LINES: MetroLineData[] = [
  metroLine1,
  metroLine2, // Add your new line here
  // ...
];
```

## Station Ordering Guidelines

### Metro Lines
- **Lines 1, 4, 7, 11, 14**: Generally East-West, order from west to east
- **Lines 2, 6**: Circular lines, choose a starting point and go clockwise
- **Lines 3, 5, 8, 9, 10, 12, 13**: Mixed directions, follow the natural flow

### RER Lines
- **RER A**: East-West through central Paris
- **RER B**: North-South through central Paris  
- **RER C**: Complex network, order by branch
- **RER D**: North-South
- **RER E**: East-West (newer line)

## Connection Format
List connections as they appear on station signage:
- Metro lines: `["1", "4", "7"]`
- RER lines: `["RER A", "RER B"]`
- Mixed: `["1", "9", "RER A"]`

## Coordinates
Use the coordinates from the CSV data to maintain consistency with the existing system.

## Line Colors
Standard RATP/SNCF line colors:
- **Metro 1**: `#FFCD00` (Yellow)
- **Metro 2**: `#0055C8` (Blue)
- **Metro 3**: `#837902` (Olive)
- **Metro 4**: `#8B5A2B` (Purple)
- **Metro 5**: `#FF7E2E` (Orange)
- **Metro 6**: `#84C318` (Light Green)
- **Metro 7**: `#FA9ABA` (Pink)
- **Metro 8**: `#CEADD2` (Light Pink)
- **Metro 9**: `#D5C900` (Gold)
- **Metro 10**: `#8B5A00` (Brown)
- **Metro 11**: `#8B4513` (Dark Brown)
- **Metro 12**: `#84C318` (Green)
- **Metro 13**: `#87CEEB` (Light Blue)
- **Metro 14**: `#6E2C7F` (Purple)
- **RER A**: `#E2312A` (Red)
- **RER B**: `#5291CE` (Blue)
- **RER C**: `#F99D1C` (Orange)
- **RER D**: `#00A88F` (Green)
- **RER E**: `#C760A0` (Purple/Pink)

## Performance Benefits
- **Faster loading**: No CSV parsing needed
- **Better ordering**: Manual control over station sequence
- **Reduced memory**: Only load needed data
- **Type safety**: Full TypeScript support

## Migration Strategy
1. Create line files gradually (start with most used lines)
2. Keep CSV parsing as fallback for missing lines
3. Eventually replace CSV entirely with line files
