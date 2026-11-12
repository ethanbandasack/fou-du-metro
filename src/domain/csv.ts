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
  /** Commune ("Paris" for the 20 arrondissements). */
  commune: string;
  /** Official IDFM transfer zone (zone de correspondance) id, "" when unknown. */
  zone: string;
  /** ISO date (YYYY-MM-DD) a future station opens, null when already open. */
  opening: string | null;
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
  "commune",
  "zone",
  "opening",
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

  const [name, line_, mode, order, lat, lon, arrondissement, ...rest] = fields;
  const [historicFigure, colorInName, openedAfter1980, leftBank] = rest.slice(0, 4).map((f) => f === "1");
  const commune = rest[4].trim();
  if (!commune) fail(`"commune" is empty`);
  if (!MODES.includes(mode as Mode)) fail(`unknown mode "${mode}"`);
  const number = (value: string, column: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fail(`"${column}" is not a number`);
  };

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
    commune,
    zone: rest[5].trim(),
    opening: opening(rest[6].trim(), fail),
  };
}

function opening(value: string, fail: (reason: string) => never): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fail(`"opening" must be YYYY-MM-DD, got "${value}"`);
}

/** Inverse of parseStationsCsv (LF line endings, bis lines written "3bis"). */
export function formatStationsCsv(rows: StopRow[]): string {
  const flag = (value: boolean) => (value ? "1" : "0");
  const lines = rows.map((r) =>
    [
      r.name,
      r.lineId,
      r.mode,
      r.order,
      r.lat,
      r.lon,
      r.arrondissement,
      flag(r.historicFigure),
      flag(r.colorInName),
      flag(r.openedAfter1980),
      flag(r.leftBank),
      r.commune,
      r.zone,
      r.opening ?? "",
    ].join(","),
  );
  return [COLUMNS.join(","), ...lines].join("\n") + "\n";
}
