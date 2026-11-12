import { MODES, normalizeLineId, type Mode } from "@/domain/lines";

/** One row of `stations.csv`: a station served by one line. */
export interface StopRow {
  name: string;
  lineId: string;
  mode: Mode;
  /** Order from the CSV; the YAML line files take precedence for display. */
  order: number;
  lat: number;
  lon: number;
  /** 1-20 for Paris arrondissements, otherwise the département number. */
  arrondissement: number;
  historicFigure: boolean;
  colorInName: boolean;
  openedAfter1980: boolean;
  leftBank: boolean;
  hasRer: boolean;
  hasTram: boolean;
}

const COLUMNS = [
  "nom",
  "line",
  "mode",
  "order",
  "lat",
  "lon",
  "arrondissement",
  "figure_historique",
  "couleur",
  "ouverte_apres_1980",
  "rive_gauche",
  "has_rer",
  "has_tram",
] as const;

/** Parses `stations.csv` (comma separated, no quoting). Throws on malformed input. */
export function parseStationsCsv(text: string): StopRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines[0] !== COLUMNS.join(",")) {
    throw new Error(`stations.csv: unexpected header, expected "${COLUMNS.join(",")}"`);
  }
  return lines.slice(1).map((line, index) => parseRow(line, index + 2));
}

function parseRow(line: string, lineNumber: number): StopRow {
  const fail = (reason: string): never => {
    throw new Error(`stations.csv line ${lineNumber}: ${reason}`);
  };
  const fields = line.split(",");
  if (fields.length !== COLUMNS.length) fail(`expected ${COLUMNS.length} fields, got ${fields.length}`);

  const [name, line_, mode, order, lat, lon, arrondissement, ...flags] = fields;
  if (!MODES.includes(mode as Mode)) fail(`unknown mode "${mode}"`);
  const number = (value: string, column: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fail(`"${column}" is not a number`);
  };
  const [historicFigure, colorInName, openedAfter1980, leftBank, hasRer, hasTram] = flags.map((f) => f === "1");

  return {
    name,
    lineId: normalizeLineId(line_),
    mode: mode as Mode,
    order: number(order, "order"),
    lat: number(lat, "lat"),
    lon: number(lon, "lon"),
    arrondissement: number(arrondissement, "arrondissement"),
    historicFigure,
    colorInName,
    openedAfter1980,
    leftBank,
    hasRer,
    hasTram,
  };
}
