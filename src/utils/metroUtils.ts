import { MetroStation, MetroLine, EnrichedStation } from "@/types/metro";
// Build trigger: Updated at 2026-04-27 03:22
import {
  getStationsFromLineData,
  getOrderedStationsByLine,
} from "@/data/lines";

// Official IDFM Color Palette
const COLORS = {
  ROUGE_COQUELICOT: { bg: "#E3051C", text: "#FFFFFF" },
  ORANGE: { bg: "#F28E42", text: "#000000" },
  JAUNE_VIF: { bg: "#FFCE00", text: "#000000" },
  JAUNE_OCRE: { bg: "#E3B32A", text: "#000000" },
  MARRON: { bg: "#8D5E2A", text: "#FFFFFF" },
  OLIVE_CLAIR: { bg: "#D5C900", text: "#000000" },
  OLIVE_FONCE: { bg: "#9F9825", text: "#FFFFFF" },
  VERT_FONCE: { bg: "#00814F", text: "#FFFFFF" },
  VERT_CLAIR: { bg: "#83C491", text: "#000000" },
  TURQUOISE: { bg: "#00A88F", text: "#FFFFFF" },
  BLEU_CLAIR: { bg: "#98D4E2", text: "#000000" },
  BLEU_OUTREMER: { bg: "#5291CE", text: "#FFFFFF" },
  BLEU_FONCE: { bg: "#0064B0", text: "#FFFFFF" },
  VIOLET: { bg: "#662483", text: "#FFFFFF" },
  MAGENTA: { bg: "#C04191", text: "#FFFFFF" },
  LILAS: { bg: "#CEADD2", text: "#000000" },
  ROSE: { bg: "#F3A4BA", text: "#000000" },
  ROUGE_FRAMBOISE: { bg: "#B90845", text: "#FFFFFF" },
  BLEU_NUIT: { bg: "#003264", text: "#FFFFFF" },
};

// Map of line identifiers to their official colors
export const LINE_COLORS: Record<string, string> = {
  // Métro
  "1": COLORS.JAUNE_VIF.bg,
  "2": COLORS.BLEU_FONCE.bg,
  "3": COLORS.OLIVE_FONCE.bg,
  "3bis": COLORS.BLEU_CLAIR.bg,
  "4": COLORS.MAGENTA.bg,
  "5": COLORS.ORANGE.bg,
  "6": COLORS.VERT_CLAIR.bg,
  "7": COLORS.ROSE.bg,
  "7bis": COLORS.VERT_CLAIR.bg,
  "8": COLORS.LILAS.bg,
  "9": COLORS.OLIVE_CLAIR.bg,
  "10": COLORS.JAUNE_OCRE.bg,
  "11": COLORS.MARRON.bg,
  "12": COLORS.VERT_FONCE.bg,
  "13": COLORS.BLEU_CLAIR.bg,
  "14": COLORS.VIOLET.bg,
  "15": COLORS.ROUGE_FRAMBOISE.bg,
  "16": COLORS.ROSE.bg,
  "17": COLORS.OLIVE_CLAIR.bg,
  "18": COLORS.TURQUOISE.bg,

  // RER
  "A": COLORS.ROUGE_COQUELICOT.bg,
  "B": COLORS.BLEU_OUTREMER.bg,
  "C": COLORS.JAUNE_VIF.bg,
  "D": COLORS.VERT_FONCE.bg,
  "E": COLORS.MAGENTA.bg,

  // Tramway
  "T1": COLORS.BLEU_FONCE.bg,
  "T2": COLORS.MAGENTA.bg,
  "T3a": COLORS.ORANGE.bg,
  "T3b": COLORS.VERT_FONCE.bg,
  "T4": COLORS.JAUNE_OCRE.bg,
  "T5": COLORS.VIOLET.bg,
  "T6": COLORS.ROUGE_COQUELICOT.bg,
  "T7": COLORS.MARRON.bg,
  "T8": COLORS.OLIVE_FONCE.bg,
  "T9": COLORS.BLEU_OUTREMER.bg,
  "T10": COLORS.OLIVE_FONCE.bg,
  "T11": COLORS.ORANGE.bg,
  "T12": COLORS.ROUGE_FRAMBOISE.bg,
  "T13": COLORS.MARRON.bg,
  "T14": COLORS.TURQUOISE.bg,

  // Transilien
  "H": COLORS.MARRON.bg,
  "J": COLORS.OLIVE_CLAIR.bg,
  "K": COLORS.OLIVE_FONCE.bg,
  "L": COLORS.LILAS.bg,
  "N": COLORS.TURQUOISE.bg,
  "P": COLORS.ORANGE.bg,
  "R": COLORS.ROSE.bg,
  "U": COLORS.ROUGE_FRAMBOISE.bg,
  "V": COLORS.OLIVE_FONCE.bg,

  // Cable
  "C1": COLORS.BLEU_OUTREMER.bg,
};

export const LINE_TEXT_COLORS: Record<string, string> = {
  // Métro
  "1": COLORS.JAUNE_VIF.text,
  "2": COLORS.BLEU_FONCE.text,
  "3": COLORS.OLIVE_FONCE.text,
  "3bis": COLORS.BLEU_CLAIR.text,
  "4": COLORS.MAGENTA.text,
  "5": COLORS.ORANGE.text,
  "6": COLORS.VERT_CLAIR.text,
  "7": COLORS.ROSE.text,
  "7bis": COLORS.VERT_CLAIR.text,
  "8": COLORS.LILAS.text,
  "9": COLORS.OLIVE_CLAIR.text,
  "10": COLORS.JAUNE_OCRE.text,
  "11": COLORS.MARRON.text,
  "12": COLORS.VERT_FONCE.text,
  "13": COLORS.BLEU_CLAIR.text,
  "14": COLORS.VIOLET.text,
  "15": COLORS.ROUGE_FRAMBOISE.text,
  "16": COLORS.ROSE.text,
  "17": COLORS.OLIVE_CLAIR.text,
  "18": COLORS.TURQUOISE.text,

  // RER
  "A": COLORS.ROUGE_COQUELICOT.text,
  "B": COLORS.BLEU_OUTREMER.text,
  "C": COLORS.JAUNE_VIF.text,
  "D": COLORS.VERT_FONCE.text,
  "E": COLORS.MAGENTA.text,

  // Tramway
  "T1": COLORS.BLEU_FONCE.text,
  "T2": COLORS.MAGENTA.text,
  "T3a": COLORS.ORANGE.text,
  "T3b": COLORS.VERT_FONCE.text,
  "T4": COLORS.JAUNE_OCRE.text,
  "T5": COLORS.VIOLET.text,
  "T6": COLORS.ROUGE_COQUELICOT.text,
  "T7": COLORS.MARRON.text,
  "T8": COLORS.OLIVE_FONCE.text,
  "T9": COLORS.BLEU_OUTREMER.text,
  "T10": COLORS.OLIVE_FONCE.text,
  "T11": COLORS.ORANGE.text,
  "T12": COLORS.ROUGE_FRAMBOISE.text,
  "T13": COLORS.MARRON.text,
  "T14": COLORS.TURQUOISE.text,

  // Transilien
  "H": COLORS.MARRON.text,
  "J": COLORS.OLIVE_CLAIR.text,
  "K": COLORS.OLIVE_FONCE.text,
  "L": COLORS.LILAS.text,
  "N": COLORS.TURQUOISE.text,
  "P": COLORS.ORANGE.text,
  "R": COLORS.ROSE.text,
  "U": COLORS.ROUGE_FRAMBOISE.text,
  "V": COLORS.OLIVE_FONCE.text,

  // Cable
  "C1": COLORS.BLEU_OUTREMER.text,
};

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let braceCount = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "{" && !inQuotes) {
      braceCount++;
      current += char;
    } else if (char === "}" && !inQuotes) {
      braceCount--;
      current += char;
    } else if (char === ";" && !inQuotes && braceCount === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function groupStationsByLine(stations: MetroStation[]): MetroLine[] {
  const linesMap = new Map<string, MetroStation[]>();

  stations.forEach((station) => {
    const key = `${station.mode}-${station.line}`;
    if (!linesMap.has(key)) {
      linesMap.set(key, []);
    }
    linesMap.get(key)!.push(station);
  });

  const lines: MetroLine[] = [];
  linesMap.forEach((stationsInLine, key) => {
    const [mode, line] = key.split("-");
    lines.push({
      line,
      mode: mode as MetroLine["mode"],
      color: LINE_COLORS[line] || "#666666",
      stations: stationsInLine.sort((a, b) =>
        a.nom_long.localeCompare(b.nom_long),
      ),
    });
  });

  // Sort lines: Metro first (by number), then TRAMWAY, then CABLE, then RER, then others
  return lines.sort((a, b) => {
    const modeOrder = ["METRO", "TRAMWAY", "CABLE", "RER", "VAL", "TRAIN"];
    const aModeIndex = modeOrder.indexOf(a.mode);
    const bModeIndex = modeOrder.indexOf(b.mode);

    if (aModeIndex !== bModeIndex) {
      return aModeIndex - bModeIndex;
    }

    // Same mode: Sort by line identifier numerically if possible
    const extractNum = (s: string) => {
      const m = s.match(/\d+/);
      return m ? parseInt(m[0]) : 0;
    };

    const numA = extractNum(a.line);
    const numB = extractNum(b.line);

    if (numA !== numB && numA !== 0 && numB !== 0) {
      return numA - numB;
    }

    // Fallback to alphabetical for same numbers (e.g., 3 and 3bis) or non-numeric
    return a.line.localeCompare(b.line, undefined, { numeric: true, sensitivity: 'base' });
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

// New optimized functions using generated line data
export function getOptimizedStations(): MetroStation[] {
  return getStationsFromLineData();
}

export function getEnrichedStations(): EnrichedStation[] {
  // This is a placeholder, in a real Next.js app we might fetch this from an API or use fs in server components
  return [];
}

export function getOptimizedStationsByLine(): Record<string, MetroStation[]> {
  return getOrderedStationsByLine();
}

export function getLineColor(lineName: string): string {
  // Extract line number/letter from "METRO 1", "RER A", etc.
  const parts = lineName.split(" ");
  const lineId = parts[parts.length - 1];
  return LINE_COLORS[lineId] || "#9CA3AF"; // Default gray color
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
