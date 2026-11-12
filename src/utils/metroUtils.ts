export function simpleNormalize(name: string): string {
  if (!name) return "";
  return name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function normalizeStationName(name: string): string {
  if (!name) return "";
  
  let normalized = name.toLowerCase();
  
  // Ignore "Gare de " prefix
  if (normalized.startsWith("gare de ")) {
    normalized = normalized.substring(8);
  } else if (normalized.startsWith("gare d'")) {
    normalized = normalized.substring(7);
  }
  
  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function fuzzyMatch(input: string, stationName: string, altName?: string): boolean {
  if (!input) return false;
  
  const match = (target: string) => {
    if (!target) return false;
    const normalizedInput = normalizeStationName(input);
    const normalizedTarget = normalizeStationName(target);
    
    if (normalizedInput === normalizedTarget) return true;
    if (normalizedInput.length >= 3 && (normalizedTarget.includes(normalizedInput) || normalizedInput.includes(normalizedTarget))) {
      return true;
    }
    return false;
  };

  return match(stationName) || (altName ? match(altName) : false);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
