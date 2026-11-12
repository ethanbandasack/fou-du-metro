import { describe, expect, it } from "vitest";
import { parseStationsCsv } from "@/domain/csv";

const HEADER =
  "nom,line,mode,order,lat,lon,arrondissement,figure_historique,couleur,ouverte_apres_1980,rive_gauche,has_rer,has_tram,commune";

describe("parseStationsCsv", () => {
  it("parses a row into a typed stop row", () => {
    const rows = parseStationsCsv(`${HEADER}\nGambetta,3B,METRO,1,48.86,2.39,20,1,0,0,0,0,1,Paris\n`);
    expect(rows).toEqual([
      {
        name: "Gambetta",
        lineId: "3bis",
        mode: "METRO",
        order: 1,
        lat: 48.86,
        lon: 2.39,
        arrondissement: 20,
        historicFigure: true,
        colorInName: false,
        openedAfter1980: false,
        leftBank: false,
        hasRer: false,
        hasTram: true,
        commune: "Paris",
      },
    ]);
  });

  it("accepts CRLF line endings and blank trailing lines", () => {
    const rows = parseStationsCsv(`${HEADER}\r\nNation,1,METRO,21,48.84,2.39,12,0,0,0,0,1,0,Paris\r\n\r\n`);
    expect(rows.map((r) => r.name)).toEqual(["Nation"]);
  });

  it("rejects an unexpected header", () => {
    expect(() => parseStationsCsv("name,line\nNation,1")).toThrow(/header/i);
  });

  it("reports the line number of a malformed row", () => {
    expect(() => parseStationsCsv(`${HEADER}\nNation,1,METRO`)).toThrow(/line 2/);
  });

  it("rejects an unknown transport mode", () => {
    expect(() => parseStationsCsv(`${HEADER}\nNation,1,BUS,21,48.84,2.39,12,0,0,0,0,1,0,Paris`)).toThrow(/mode/);
  });
});
