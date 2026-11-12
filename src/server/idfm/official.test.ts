import { describe, expect, it } from "vitest";
import { parseOfficialLines, parseOfficialStops, parseProjectStops } from "@/server/idfm/official";

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
    status: "active",
  });

  it("reads the official web colors with our line ids", () => {
    expect(parseOfficialLines([line("3B", "metro"), line("FUN", "funicular")])).toEqual([
      { lineId: "3bis", active: true, colors: { background: "#FFBE00", text: "#000000" } },
      { lineId: "FUNICULAIRE", active: true, colors: { background: "#FFBE00", text: "#000000" } },
    ]);
  });

  it("skips the generic TER entries", () => {
    expect(parseOfficialLines([line("TER", "rail", "TER")])).toEqual([]);
  });
});

describe("parseOfficialLines status", () => {
  it("marks lines announced but not open as inactive", () => {
    const [line] = parseOfficialLines([
      { shortname_line: "15", transportmode: "metro", networkname: null, colourweb_hexa: "aaaaaa", textcolourweb_hexa: "000000", status: "prochainement active" },
    ]);
    expect(line.active).toBe(false);
  });
});

describe("parseProjectStops", () => {
  const stop = (nom_arret: string, res_com: string, id_operati: string, extra: object = {}) => ({
    nom_arret,
    res_com,
    id_operati,
    mode: "métro",
    variante: "0",
    geo_point_2d: { lon: 2.2, lat: 48.82 },
    ...extra,
  });
  const lines = [
    { id_operati: "11501", mes_estime: "2027-12-31T00:00:00+00:00" },
    { id_operati: "11803", mes_estime: "2026-10-31T00:00:00+00:00" },
  ];
  const parse = (stops: unknown[]) => parseProjectStops(stops, lines, "2026-11-12");

  it("maps project stops of rail lines with their estimated opening", () => {
    expect(parse([stop("Bagneux", "METRO 15", "11501")])).toEqual([
      { name: "Bagneux", lineId: "15", mode: "METRO", lat: 48.82, lon: 2.2, zdcId: "", zdcName: "", openedOn: "2027-12-31" },
    ]);
  });

  it.each([
    ["TRAM 1", "T1", "TRAMWAY"],
    ["RER E", "E", "RER"],
  ])("maps %s to line %s", (resCom, lineId, mode) => {
    expect(parse([stop("X", resCom, "11501", { mode: "tram" })])[0]).toMatchObject({ lineId, mode });
  });

  it("skips buses, variants and stops without an estimated date", () => {
    expect(parse([
      stop("Bus", "BUS SENIA", "11501", { mode: "bus" }),
      stop("Variante", "METRO 15", "11501", { variante: "1" }),
      stop("Sans date", "TRAM 4", "99999"),
    ])).toEqual([]);
  });

  it("keeps one stop per line and name, the earliest", () => {
    const later = { id_operati: "11502", mes_estime: "2031-12-31T00:00:00+00:00" };
    const stops = parseProjectStops([stop("Champigny Centre", "METRO 15", "11502"), stop("Champigny Centre", "METRO 15", "11501")], [...lines, later], "2026-11-12");
    expect(stops.map((s) => s.openedOn)).toEqual(["2027-12-31"]);
  });

  it("moves an estimate already past to the end of the year: the station is still not open", () => {
    expect(parse([stop("Polytechnique", "METRO 18", "11803")])[0].openedOn).toBe("2026-12-31");
  });
});
