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

// Official IDFM palette.
const PALETTE = {
  ROUGE_COQUELICOT: { background: "#E3051C", text: "#FFFFFF" },
  ORANGE: { background: "#F28E42", text: "#000000" },
  JAUNE_VIF: { background: "#FFCE00", text: "#000000" },
  JAUNE_OCRE: { background: "#E3B32A", text: "#000000" },
  MARRON: { background: "#8D5E2A", text: "#FFFFFF" },
  OLIVE_CLAIR: { background: "#D5C900", text: "#000000" },
  OLIVE_FONCE: { background: "#9F9825", text: "#FFFFFF" },
  VERT_FONCE: { background: "#00814F", text: "#FFFFFF" },
  VERT_CLAIR: { background: "#83C491", text: "#000000" },
  TURQUOISE: { background: "#00A88F", text: "#FFFFFF" },
  BLEU_CLAIR: { background: "#98D4E2", text: "#000000" },
  BLEU_OUTREMER: { background: "#5291CE", text: "#FFFFFF" },
  BLEU_FONCE: { background: "#0064B0", text: "#FFFFFF" },
  VIOLET: { background: "#662483", text: "#FFFFFF" },
  MAGENTA: { background: "#C04191", text: "#FFFFFF" },
  LILAS: { background: "#CEADD2", text: "#000000" },
  ROSE: { background: "#F3A4BA", text: "#000000" },
  ROUGE_FRAMBOISE: { background: "#B90845", text: "#FFFFFF" },
} satisfies Record<string, LineColors>;

const LINE_PALETTE: Record<string, LineColors> = {
  // Métro
  "1": PALETTE.JAUNE_VIF,
  "2": PALETTE.BLEU_FONCE,
  "3": PALETTE.OLIVE_FONCE,
  "3bis": PALETTE.BLEU_CLAIR,
  "4": PALETTE.MAGENTA,
  "5": PALETTE.ORANGE,
  "6": PALETTE.VERT_CLAIR,
  "7": PALETTE.ROSE,
  "7bis": PALETTE.VERT_CLAIR,
  "8": PALETTE.LILAS,
  "9": PALETTE.OLIVE_CLAIR,
  "10": PALETTE.JAUNE_OCRE,
  "11": PALETTE.MARRON,
  "12": PALETTE.VERT_FONCE,
  "13": PALETTE.BLEU_CLAIR,
  "14": PALETTE.VIOLET,
  "15": PALETTE.ROUGE_FRAMBOISE,
  "16": PALETTE.ROSE,
  "17": PALETTE.OLIVE_CLAIR,
  "18": PALETTE.TURQUOISE,
  // RER
  A: PALETTE.ROUGE_COQUELICOT,
  B: PALETTE.BLEU_OUTREMER,
  C: PALETTE.JAUNE_VIF,
  D: PALETTE.VERT_FONCE,
  E: PALETTE.MAGENTA,
  // Tramway
  T1: PALETTE.BLEU_FONCE,
  T2: PALETTE.MAGENTA,
  T3a: PALETTE.ORANGE,
  T3b: PALETTE.VERT_FONCE,
  T4: PALETTE.JAUNE_OCRE,
  T5: PALETTE.VIOLET,
  T6: PALETTE.ROUGE_COQUELICOT,
  T7: PALETTE.MARRON,
  T8: PALETTE.OLIVE_FONCE,
  T9: PALETTE.BLEU_OUTREMER,
  T10: PALETTE.OLIVE_FONCE,
  T11: PALETTE.ORANGE,
  T12: PALETTE.ROUGE_FRAMBOISE,
  T13: PALETTE.MARRON,
  T14: PALETTE.TURQUOISE,
  // Transilien
  H: PALETTE.MARRON,
  J: PALETTE.OLIVE_CLAIR,
  K: PALETTE.OLIVE_FONCE,
  L: PALETTE.LILAS,
  N: PALETTE.TURQUOISE,
  P: PALETTE.ORANGE,
  R: PALETTE.ROSE,
  U: PALETTE.ROUGE_FRAMBOISE,
  V: PALETTE.OLIVE_FONCE,
  // Câble
  C1: PALETTE.BLEU_OUTREMER,
};

const UNKNOWN_LINE: LineColors = { background: "#666666", text: "#FFFFFF" };

/** Source data spells bis lines "3B"/"7B"; the app uses "3bis"/"7bis". */
export function normalizeLineId(raw: string): string {
  const id = raw.trim();
  const bis = /^(\d+)(B|BIS)$/i.exec(id);
  return bis ? `${bis[1]}bis` : id;
}

export function lineColors(lineId: string): LineColors {
  return LINE_PALETTE[lineId] ?? UNKNOWN_LINE;
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
