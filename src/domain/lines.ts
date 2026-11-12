export type Mode = "METRO" | "RER" | "TRANSILIEN" | "TRAIN" | "TRAMWAY" | "VAL" | "CABLE";

/** Display order of transport modes. */
export const MODES: readonly Mode[] = ["METRO", "TRAMWAY", "CABLE", "RER", "TRANSILIEN", "VAL", "TRAIN"];

export const MODE_LABELS: Record<Mode, string> = {
  METRO: "Métro",
  TRAMWAY: "Tramway",
  CABLE: "Câble",
  RER: "RER",
  TRANSILIEN: "Transilien",
  VAL: "VAL",
  TRAIN: "Train",
};

export interface LineColors {
  background: string;
  text: string;
}

/**
 * Official web colors from IDFM open data (referentiel-des-lignes: colourweb_hexa /
 * textcolourweb_hexa), fetched 2026-11-12. `npm run data:audit` reports any drift.
 */
const LINE_PALETTE: Record<string, LineColors> = {
  "1": { background: "#FFBE00", text: "#000000" },
  "2": { background: "#0055C8", text: "#FFFFFF" },
  "3": { background: "#6E6E00", text: "#FFFFFF" },
  "3bis": { background: "#82C8E6", text: "#000000" },
  "4": { background: "#A0006E", text: "#FFFFFF" },
  "5": { background: "#FF5A00", text: "#000000" },
  "6": { background: "#82DC73", text: "#000000" },
  "7": { background: "#FF82B4", text: "#000000" },
  "7bis": { background: "#82DC73", text: "#000000" },
  "8": { background: "#D282BE", text: "#000000" },
  "9": { background: "#D2D200", text: "#000000" },
  "10": { background: "#DC9600", text: "#000000" },
  "11": { background: "#6E491E", text: "#FFFFFF" },
  "12": { background: "#00643C", text: "#FFFFFF" },
  "13": { background: "#82C8E6", text: "#000000" },
  "14": { background: "#640082", text: "#FFFFFF" },
  // Lines 15 to 17: color of the IDFM project data (projets_lignes_idf), not open yet.
  "15": { background: "#A50034", text: "#FFFFFF" },
  "16": { background: "#FF82B4", text: "#000000" },
  "17": { background: "#D2D200", text: "#000000" },
  "18": { background: "#00A092", text: "#FFFFFF" },
  T1: { background: "#0055C8", text: "#FFFFFF" },
  T2: { background: "#A0006E", text: "#FFFFFF" },
  T3a: { background: "#FF5A00", text: "#000000" },
  T3b: { background: "#00643C", text: "#FFFFFF" },
  T4: { background: "#DC9600", text: "#000000" },
  T5: { background: "#640082", text: "#FFFFFF" },
  T6: { background: "#FF0000", text: "#FFFFFF" },
  T7: { background: "#6E491E", text: "#FFFFFF" },
  T8: { background: "#6E6E00", text: "#FFFFFF" },
  T9: { background: "#3C91DC", text: "#FFFFFF" },
  T10: { background: "#6E6E00", text: "#FFFFFF" },
  T11: { background: "#FF5A00", text: "#000000" },
  T12: { background: "#A50034", text: "#FFFFFF" },
  T13: { background: "#8D653D", text: "#FFFFFF" },
  T14: { background: "#00A092", text: "#FFFFFF" },
  A: { background: "#EB2132", text: "#FFFFFF" },
  B: { background: "#5091CB", text: "#FFFFFF" },
  C: { background: "#FFCC30", text: "#000000" },
  C1: { background: "#3C91DC", text: "#FFFFFF" },
  "CDG VAL": { background: "#5CC5ED", text: "#FFFFFF" },
  D: { background: "#008B5B", text: "#FFFFFF" },
  E: { background: "#B94E9A", text: "#FFFFFF" },
  FUNICULAIRE: { background: "#AFAFAF", text: "#000000" },
  H: { background: "#84653D", text: "#FFFFFF" },
  J: { background: "#CEC73D", text: "#000000" },
  K: { background: "#9B9842", text: "#FFFFFF" },
  L: { background: "#C4A4CC", text: "#000000" },
  N: { background: "#00B297", text: "#FFFFFF" },
  ORLYVAL: { background: "#5EC5ED", text: "#FFFFFF" },
  P: { background: "#F58F53", text: "#000000" },
  R: { background: "#F49FB3", text: "#000000" },
  U: { background: "#B6134C", text: "#FFFFFF" },
  V: { background: "#9F9825", text: "#FFFFFF" },
};

const TER: LineColors = { background: "#AAAAAA", text: "#000000" };
const UNKNOWN_LINE: LineColors = { background: "#666666", text: "#FFFFFF" };

/** Source data spells bis lines "3B"/"7B"; the app uses "3bis"/"7bis". */
export function normalizeLineId(raw: string): string {
  const id = raw.trim();
  const bis = /^(\d+)(B|BIS)$/i.exec(id);
  return bis ? `${bis[1]}bis` : id;
}

export function lineColors(lineId: string): LineColors {
  return LINE_PALETTE[lineId] ?? (lineId.startsWith("TER ") ? TER : UNKNOWN_LINE);
}

const SHORT_IDS: Record<string, string> = { "CDG VAL": "CDG", ORLYVAL: "Orly", FUNICULAIRE: "Funi" };

/** Id short enough for a badge: "TER Normandie" -> "TER". */
export function lineShortId(lineId: string): string {
  return lineId.startsWith("TER ") ? "TER" : (SHORT_IDS[lineId] ?? lineId);
}

export function lineLabel(mode: Mode, lineId: string): string {
  return `${MODE_LABELS[mode]} ${lineId}`;
}

export function isMetroLine(lineId: string): boolean {
  return /^\d+(bis)?$/i.test(lineId);
}

/** Mode display order, then natural order of ids (3 < 3bis < 14, T2 < T10). */
export function compareLines(a: { mode: string; id: string }, b: { mode: string; id: string }): number {
  const byMode = MODES.indexOf(a.mode as Mode) - MODES.indexOf(b.mode as Mode);
  if (byMode !== 0) return byMode;
  return a.id.localeCompare(b.id, "fr", { numeric: true, sensitivity: "base" });
}
