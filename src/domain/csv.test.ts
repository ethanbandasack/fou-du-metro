import { describe, expect, it } from "vitest";
import { formatStationsCsv, parseStationsCsv } from "@/domain/csv";

const HEADER =
  "nom,line,mode,order,lat,lon,arrondissement,figure_historique,couleur,ouverte_apres_1980,rive_gauche,commune,zone,opening";

describe("parseStationsCsv", () => {
  it("parses a row into a typed stop row", () => {
    const rows = parseStationsCsv(`${HEADER}\nGambetta,3B,METRO,1,48.86,2.39,20,1,0,0,0,Paris,71645,\n`);
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
        commune: "Paris",
        zone: "71645",
        opening: null,
      },
    ]);
  });

  it("accepts CRLF line endings and blank trailing lines", () => {
    const rows = parseStationsCsv(`${HEADER}\r\nNation,1,METRO,21,48.84,2.39,12,0,0,0,0,Paris,,\r\n\r\n`);
    expect(rows.map((r) => r.name)).toEqual(["Nation"]);
  });

  it("leaves the zone empty when unknown", () => {
    const [row] = parseStationsCsv(`${HEADER}\nNation,1,METRO,21,48.84,2.39,12,0,0,0,0,Paris,,\n`);
    expect(row.zone).toBe("");
  });

  it("writes rows back in the same format", () => {
    const text = `${HEADER}\nGambetta,3bis,METRO,1,48.86,2.39,20,1,0,0,0,Paris,71645,\nPolytechnique,18,METRO,2,48.71,2.21,91,0,0,1,0,Palaiseau,63144,2026-12-01\n`;
    expect(formatStationsCsv(parseStationsCsv(text))).toBe(text);
  });

  it("rejects an unexpected header", () => {
    expect(() => parseStationsCsv("name,line\nNation,1")).toThrow(/header/i);
  });

  it("reports the line number of a malformed row", () => {
    expect(() => parseStationsCsv(`${HEADER}\nNation,1,METRO`)).toThrow(/line 2/);
  });

  it("rejects an unknown transport mode", () => {
    expect(() => parseStationsCsv(`${HEADER}\nNation,1,BUS,21,48.84,2.39,12,0,0,0,0,Paris,,`)).toThrow(/mode/);
  });
});

describe("opening column", () => {
  it("reads the opening date of a future station", () => {
    const [row] = parseStationsCsv(`${HEADER}\nPolytechnique,18,METRO,2,48.71,2.21,91,0,0,1,0,Palaiseau,63144,2026-12-01\n`);
    expect(row.opening).toBe("2026-12-01");
  });

  it("rejects a date that is not YYYY-MM-DD", () => {
    expect(() => parseStationsCsv(`${HEADER}\nX,18,METRO,2,48.71,2.21,91,0,0,1,0,Palaiseau,,déc. 2026\n`)).toThrow(/opening/);
  });
});
