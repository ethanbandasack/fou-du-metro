import { describe, expect, it } from "vitest";
import { parseOfficialLines, parseOfficialStops } from "@/server/idfm/official";

const station = (nom_gares: string, mode: string, indice_lig: string, res_com: string, extra: object = {}) => ({
  nom_gares,
  mode,
  indice_lig,
  res_com,
  id_ref_zdc: 71673,
  nom_zdc: "Nation",
  date_mise: "1900-07-19T00:00:00+00:00",
  geo_point_2d: { lon: 2.39, lat: 48.85 },
  ...extra,
});

describe("parseOfficialStops", () => {
  it("maps an emplacement-des-gares-idf record to our line ids and modes", () => {
    expect(parseOfficialStops([station("Nation", "METRO", "1", "METRO 1")])).toEqual([
      { name: "Nation", lineId: "1", mode: "METRO", lat: 48.85, lon: 2.39, zdcId: "71673", zdcName: "Nation", openedOn: "1900-07-19" },
    ]);
  });

  it.each([
    ["METRO", "3bis", "METRO 3bis", "3bis", "METRO"],
    ["TRAMWAY", "3a", "TRAM 3a", "T3a", "TRAMWAY"],
    ["CABLE", "1", "CABLE 1", "C1", "CABLE"],
    ["VAL", "CDG", "CDGVAL", "CDG VAL", "VAL"],
    ["VAL", "FUN", "FUNICULAIRE MONTMARTRE", "FUNICULAIRE", "VAL"],
    ["TRAIN", "H", "TRAIN H", "H", "TRANSILIEN"],
    ["TRAIN", "TER NORMAN", "TER NORMANDIE", "TER Normandie", "TRAIN"],
    ["RER", "A", "RER A", "A", "RER"],
  ])("maps %s %s (%s) to line %s, mode %s", (mode, indice, resCom, lineId, ourMode) => {
    const [stop] = parseOfficialStops([station("X", mode, indice, resCom)]);
    expect([stop.lineId, stop.mode]).toEqual([lineId, ourMode]);
  });

  it("keeps a missing opening date as null", () => {
    expect(parseOfficialStops([station("X", "RER", "A", "RER A", { date_mise: null })])[0].openedOn).toBeNull();
  });
});

describe("parseOfficialLines", () => {
  const line = (shortname_line: string, transportmode: string, networkname: string | null = null) => ({
    shortname_line,
    transportmode,
    networkname,
    colourweb_hexa: "ffbe00",
    textcolourweb_hexa: "000000",
  });

  it("reads the official web colors with our line ids", () => {
    expect(parseOfficialLines([line("3B", "metro"), line("FUN", "funicular")])).toEqual([
      { lineId: "3bis", colors: { background: "#FFBE00", text: "#000000" } },
      { lineId: "FUNICULAIRE", colors: { background: "#FFBE00", text: "#000000" } },
    ]);
  });

  it("skips the generic TER entries", () => {
    expect(parseOfficialLines([line("TER", "rail", "TER")])).toEqual([]);
  });
});
