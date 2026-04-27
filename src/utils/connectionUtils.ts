import aliasesData from '@/data/connection-aliases.json';

const ALIASES = aliasesData.aliases;

/**
 * Checks if two station names are officially considered aliases for a connection.
 */
export function areAliases(name1: string, name2: string): boolean {
  if (name1 === name2) return true;
  
  // Normalizing slightly to handle minor punctuation differences
  const norm = (s: string) => s.replace(/ - /g, ' ').replace(/-/g, ' ').toLowerCase();
  const n1 = norm(name1);
  const n2 = norm(name2);
  
  if (n1 === n2) return true;

  return ALIASES.some(a => 
    (norm(a.name1) === n1 && norm(a.name2) === n2) || 
    (norm(a.name1) === n2 && norm(a.name2) === n1)
  );
}

/**
 * Returns all known aliases for a given station name.
 */
export function getAliasesForName(name: string): string[] {
  const aliases = new Set<string>([name]);
  
  ALIASES.forEach(a => {
    if (a.name1 === name) aliases.add(a.name2);
    if (a.name2 === name) aliases.add(a.name1);
  });
  
  return Array.from(aliases);
}

/**
 * Generic station grouping logic used by both Classic and Intersection modes.
 * Groups stations that have the same name or are aliases AND are geographically close.
 */
export function findStationGroup<T extends { nom?: string; nom_long?: string; coordinates?: { lat: number; lng: number }; lat?: number; lon?: number }>(
  allGroups: T[][],
  station: T,
  proximityThreshold = 0.01 // ~1km
): T[] | undefined {
  const name = station.nom || station.nom_long || '';
  const lat = station.coordinates?.lat ?? station.lat ?? 0;
  const lon = station.coordinates?.lng ?? station.lon ?? 0;

  for (const group of allGroups) {
    const first = group[0];
    const firstName = first.nom || first.nom_long || '';
    const firstLat = first.coordinates?.lat ?? first.lat ?? 0;
    const firstLon = first.coordinates?.lng ?? first.lon ?? 0;

    if (areAliases(firstName, name)) {
      const latDiff = Math.abs(firstLat - lat);
      const lonDiff = Math.abs(firstLon - lon);
      
      if (latDiff < proximityThreshold && lonDiff < proximityThreshold) {
        return group;
      }
    }
  }
  
  return undefined;
}
