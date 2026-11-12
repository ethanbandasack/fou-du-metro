import { normalizeLineId, type LineColors, type Mode } from "@/domain/lines";

/**
 * Île-de-France Mobilités open data (Opendatasoft Explore API v2.1, no key):
 * - emplacement-des-gares-idf: one record per rail station and line, with its transfer zone (ZdC)
 * - referentiel-des-lignes: every line with its official web colors
 * See docs/DATA-SOURCES.md.
 */
export const IDFM_API = "https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets";

/** A station served by a line, as published by IDFM. */
export interface OfficialStop {
  name: string;
  lineId: string;
  mode: Mode;
  lat: number;
  lon: number;
  /** Zone de correspondance: stops sharing it form one official interchange. */
  zdcId: string;
  zdcName: string;
  /** ISO date (YYYY-MM-DD) the station opened on this line, when known. */
  openedOn: string | null;
}

export interface OfficialLine {
  lineId: string;
  /** Open; lines announced for later carry placeholder colors. */
  active: boolean;
  colors: LineColors;
}

interface StationRecord {
  nom_gares: string;
  mode: string;
  indice_lig: string;
  res_com: string;
  id_ref_zdc: number | string;
  nom_zdc: string;
  date_mise: string | null;
  geo_point_2d: { lon: number; lat: number };
}

interface LineRecord {
  shortname_line: string;
  transportmode: string;
  networkname: string | null;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
  status: string;
}

const NAMED_LINES: Record<string, string> = {
  CDGVAL: "CDG VAL",
  ORLYVAL: "ORLYVAL",
  "FUNICULAIRE MONTMARTRE": "FUNICULAIRE",
  "TER BOURGOGNE-FC": "TER Bourgogne - Franche-Comté",
  "TER CENTRE-VDL": "TER Centre - Val de Loire",
  "TER GRAND-EST": "TER Grand-Est",
  "TER HAUTS-DE-FRANCE": "TER Hauts-de-France",
  "TER NORMANDIE": "TER Normandie",
};

function lineOf(record: StationRecord): { lineId: string; mode: Mode } {
  const named = NAMED_LINES[record.res_com];
  switch (record.mode) {
    case "METRO":
      return { lineId: normalizeLineId(record.indice_lig), mode: "METRO" };
    case "TRAMWAY":
      return { lineId: `T${record.indice_lig}`, mode: "TRAMWAY" };
    case "CABLE":
      return { lineId: `C${record.indice_lig}`, mode: "CABLE" };
    case "VAL":
      return { lineId: named ?? record.indice_lig, mode: "VAL" };
    case "TRAIN":
      return named ? { lineId: named, mode: "TRAIN" } : { lineId: record.indice_lig, mode: "TRANSILIEN" };
    default:
      return { lineId: record.indice_lig, mode: record.mode as Mode };
  }
}

export function parseOfficialStops(records: unknown[]): OfficialStop[] {
  return (records as StationRecord[]).map((record) => ({
    name: record.nom_gares,
    ...lineOf(record),
    lat: record.geo_point_2d.lat,
    lon: record.geo_point_2d.lon,
    zdcId: String(record.id_ref_zdc),
    zdcName: record.nom_zdc,
    openedOn: record.date_mise ? record.date_mise.slice(0, 10) : null,
  }));
}

const LINE_IDS: Record<string, string> = { FUN: "FUNICULAIRE" };

export function parseOfficialLines(records: unknown[]): OfficialLine[] {
  return (records as LineRecord[])
    .filter((record) => record.networkname !== "TER")
    .map((record) => ({
      lineId: LINE_IDS[record.shortname_line] ?? normalizeLineId(record.shortname_line),
      active: record.status === "active",
      colors: {
        background: `#${record.colourweb_hexa.toUpperCase()}`,
        text: `#${record.textcolourweb_hexa.toUpperCase()}`,
      },
    }));
}

interface ProjectStopRecord {
  nom_arret: string;
  res_com: string;
  id_operati: string;
  mode: string;
  variante: string;
  geo_point_2d: { lon: number; lat: number };
}

interface ProjectLineRecord {
  id_operati: string;
  mes_estime: string | null;
}

const PROJECT_LINES: [RegExp, (id: string) => { lineId: string; mode: Mode }][] = [
  [/^METRO (\w+)$/, (id) => ({ lineId: normalizeLineId(id), mode: "METRO" })],
  [/^TRAM (\w+)$/, (id) => ({ lineId: `T${id}`, mode: "TRAMWAY" })],
  [/^RER (\w)$/, (id) => ({ lineId: id, mode: "RER" })],
];

/**
 * Rail stops of projets_arrets_idf (lines and extensions under construction or planned), with the
 * estimated opening of their operation (projets_lignes_idf). An estimate already past means a delay:
 * it moves to the end of the current year.
 */
export function parseProjectStops(stops: unknown[], lines: unknown[], today: string): OfficialStop[] {
  const estimates = new Map<string, string>();
  for (const line of lines as ProjectLineRecord[]) {
    if (!line.mes_estime) continue;
    const date = line.mes_estime.slice(0, 10);
    const known = estimates.get(line.id_operati);
    if (!known || date > known) estimates.set(line.id_operati, date);
  }
  const byKey = new Map<string, OfficialStop>();
  for (const stop of stops as ProjectStopRecord[]) {
    const estimate = estimates.get(stop.id_operati);
    const pattern = PROJECT_LINES.find(([regex]) => regex.test(stop.res_com));
    if (stop.mode === "bus" || stop.variante !== "0" || !estimate || !pattern) continue;
    const [regex, toLine] = pattern;
    const { lineId, mode } = toLine(regex.exec(stop.res_com)![1]);
    const openedOn = estimate > today ? estimate : `${today.slice(0, 4)}-12-31`;
    const key = `${lineId}|${stop.nom_arret.toLowerCase()}`;
    const known = byKey.get(key);
    if (known && known.openedOn! <= openedOn) continue;
    byKey.set(key, { name: stop.nom_arret, lineId, mode, lat: stop.geo_point_2d.lat, lon: stop.geo_point_2d.lon, zdcId: "", zdcName: "", openedOn });
  }
  return [...byKey.values()];
}
