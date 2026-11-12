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
