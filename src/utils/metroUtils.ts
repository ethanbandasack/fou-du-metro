import { MetroStation, MetroLine } from '@/types/metro';
import { getStationsFromLineData, getOrderedStationsByLine } from '@/data/lines';

// Map of metro line colors
const LINE_COLORS: Record<string, string> = {
  '1': '#FFCD00',
  '2': '#0064B0',
  '3': '#9F9825',
  '4': '#C04191',
  '5': '#FF7E2E',
  '6': '#6ECA97',
  '7': '#FA9ABA',
  '8': '#E19BDF',
  '9': '#B6BD00',
  '10': '#C9910D',
  '11': '#704B1C',
  '12': '#007852',
  '13': '#6EC4E8',
  '14': '#62259D',
  'A': '#E2231A',
  'B': '#7BA3DC',
  'C': '#F99D1D',
  'D': '#009639',
  'E': '#E3B32A',
};

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let braceCount = 0;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '{') {
      braceCount++;
      current += char;
    } else if (char === '}') {
      braceCount--;
      current += char;
    } else if (char === ';' && !inQuotes && braceCount === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    result.push(current.trim());
  }
  
  return result;
}

export function parseMetroStationsCSV(csvContent: string): MetroStation[] {
  const lines = csvContent.trim().split('\n');
  const stations: MetroStation[] = [];
  
  // Expected header: Geo Point;Geo Shape;gares_id;nom_long;nom_so_gar;nom_su_gar;id_ref_ZdC;nom_ZdC;id_ref_ZdA;nom_ZdA;idrefliga;idrefligc;res_com;indice_lig;mode;tertrain;terrer;termetro;tertram;terval;exploitant;idf;principal;x;y;picto ligne;nom_iv
  
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    
    if (fields.length >= 15) {
      const geoPoint = fields[0];
      const gares_id = fields[2];
      const nom_long = fields[3];
      const nom_so_gar = fields[4];
      const nom_su_gar = fields[5];
      const indice_lig = fields[13];
      const mode = fields[14] as MetroStation['mode'];
      const exploitant = fields[20] as MetroStation['exploitant'];
      
      // Extract coordinates from geo point
      let coordinates: { lat: number; lng: number } | undefined;
      if (geoPoint && geoPoint.includes(',')) {
        const coords = geoPoint.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          coordinates = { lat: coords[0], lng: coords[1] };
        }
      }
      
      // Only include transport modes we want for the quiz
      if (['METRO', 'RER', 'TRAIN', 'TRAMWAY', 'VAL'].includes(mode)) {
        const station: MetroStation = {
          id: `${gares_id}-${indice_lig}`,
          gares_id,
          nom_long,
          nom_so_gar: nom_so_gar || undefined,
          nom_su_gar: nom_su_gar || undefined,
          line: indice_lig,
          lineColor: LINE_COLORS[indice_lig] || '#666666',
          mode,
          exploitant,
          connections: [], // We'll fill this later by finding stations with multiple lines
          coordinates,
          isGuessed: false,
        };
        
        stations.push(station);
      }
    }
  }
  
  // Group stations by name to find connections
  const stationsByName = new Map<string, MetroStation[]>();
  stations.forEach(station => {
    const name = station.nom_long.toLowerCase();
    if (!stationsByName.has(name)) {
      stationsByName.set(name, []);
    }
    stationsByName.get(name)!.push(station);
  });
  
  // Update connections for stations that appear on multiple lines
  stations.forEach(station => {
    const name = station.nom_long.toLowerCase();
    const sameNameStations = stationsByName.get(name) || [];
    const connections = sameNameStations
      .filter(s => s.line !== station.line)
      .map(s => s.line);
    station.connections = [...new Set(connections)];
  });
  
  return stations;
}

export function groupStationsByLine(stations: MetroStation[]): MetroLine[] {
  const lineMap = new Map<string, MetroStation[]>();
  
  stations.forEach(station => {
    const key = `${station.mode}-${station.line}`;
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
    }
    lineMap.get(key)!.push(station);
  });
  
  const lines: MetroLine[] = [];
  lineMap.forEach((stationsInLine, key) => {
    const [mode, line] = key.split('-');
    lines.push({
      line,
      mode: mode as MetroLine['mode'],
      color: LINE_COLORS[line] || '#666666',
      stations: stationsInLine.sort((a, b) => a.nom_long.localeCompare(b.nom_long)),
    });
  });
  
  // Sort lines: Metro first (by number), then RER (by letter), then others
  return lines.sort((a, b) => {
    if (a.mode === 'METRO' && b.mode === 'METRO') {
      return parseInt(a.line) - parseInt(b.line);
    }
    if (a.mode === 'RER' && b.mode === 'RER') {
      return a.line.localeCompare(b.line);
    }
    if (a.mode === 'METRO') return -1;
    if (b.mode === 'METRO') return 1;
    if (a.mode === 'RER') return -1;
    if (b.mode === 'RER') return 1;
    return a.line.localeCompare(b.line);
  });
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function normalizeStationName(name: string): string {
  return name.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters AND spaces
    .trim();
}

// Common abbreviations mapping for station names
const ABBREVIATION_MAP: Record<string, string[]> = {
  'pl': ['place'],
  'ave': ['avenue'],
  'st': ['saint', 'sainte'],
  'bld': ['boulevard'],
  'bd': ['boulevard'],
  'pont': ['pont'],
  'gare': ['gare'],
  'metro': ['metro'],
  'rer': ['rer'],
  'ch': ['charles'],
  'gen': ['general'],
  'dr': ['docteur'],
  'pres': ['president'],
  'rep': ['republique'],
  'univ': ['universite'],
  'hosp': ['hopital'],
  'egl': ['eglise'],
  'cath': ['cathedrale'],
  'mus': ['musee'],
  'parc': ['parc'],
  'jardin': ['jardin'],
  'ctr': ['centre'],
  'cen': ['centre'],
  'nat': ['national', 'nationale'],
  'intl': ['international', 'internationale'],
  'nord': ['nord'],
  'sud': ['sud'],
  'est': ['est'],
  'ouest': ['ouest'],
  'gde': ['grande'],
  'pt': ['petit', 'petite', 'pont'],
  'nle': ['nouvelle'],
  'anc': ['ancien', 'ancienne']
};

export function expandAbbreviations(text: string): string[] {
  const words = text.split(' ');
  const variations: string[] = [text];
  
  // Generate variations by expanding abbreviations
  words.forEach((word, index) => {
    if (ABBREVIATION_MAP[word]) {
      ABBREVIATION_MAP[word].forEach(expansion => {
        const expandedWords = [...words];
        expandedWords[index] = expansion;
        variations.push(expandedWords.join(' '));
      });
    }
  });
  
  return [...new Set(variations)];
}

export function fuzzyMatch(searchTerm: string, stationName: string, altName?: string): boolean {
  
  // Also create versions with spaces removed from hyphens for matching
  const createVariations = (name: string) => {
    const normalized = name.toLowerCase().trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove accents
    
    return [
      normalized.replace(/[^a-z0-9]/g, ''), // Remove all special chars and spaces
      normalized.replace(/[-\s]+/g, ''), // Remove hyphens and spaces specifically
      normalized.replace(/[-]/g, ' ').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ''), // Convert hyphens to spaces then remove spaces
    ];
  };
  
  const searchVariations = createVariations(searchTerm);
  const stationVariations = createVariations(stationName);
  const altVariations = altName ? createVariations(altName) : [];
  
  // Check if any search variation matches any station variation
  for (const searchVar of searchVariations) {
    for (const stationVar of stationVariations) {
      if (searchVar === stationVar) return true;
    }
    for (const altVar of altVariations) {
      if (searchVar === altVar) return true;
    }
  }
  
  return false;
}

/**
 * Groups stations by transport mode and line
 */
export function getLinesByType(stations: MetroStation[]): Record<string, Record<string, MetroStation[]>> {
  const linesByType: Record<string, Record<string, MetroStation[]>> = {};
  
  stations.forEach(station => {
    const type = station.mode.toLowerCase();
    const line = station.line;
    
    if (!linesByType[type]) {
      linesByType[type] = {};
    }
    
    if (!linesByType[type][line]) {
      linesByType[type][line] = [];
    }
    
    linesByType[type][line].push(station);
  });
  
  // Sort stations within each line
  Object.keys(linesByType).forEach(type => {
    Object.keys(linesByType[type]).forEach(line => {
      linesByType[type][line].sort((a, b) => a.nom_long.localeCompare(b.nom_long));
    });
  });
  
  return linesByType;
}

// New optimized functions using generated line data
export function getOptimizedStations(): MetroStation[] {
  return getStationsFromLineData();
}

export function getOptimizedStationsByLine(): Record<string, MetroStation[]> {
  return getOrderedStationsByLine();
}

export function getLineColor(lineName: string): string {
  // Extract line number/letter from "METRO 1", "RER A", etc.
  const parts = lineName.split(' ');
  const lineId = parts[parts.length - 1];
  return LINE_COLORS[lineId] || '#9CA3AF'; // Default gray color
}
