import { describe, expect, it } from "vitest";
import type { Line, Stop } from "@/domain/network";
import { progressBy } from "@/tui/progress";

const stop = (name: string, arrondissement: number, commune: string): Stop => ({
  id: name, key: name.toLowerCase(), name, lineId: "", mode: "METRO", order: 1, lat: 0, lon: 0,
  arrondissement, commune, opening: null, connections: [],
});
const line = (id: string, stops: Stop[]): Line => ({
  id, mode: "METRO", label: `Métro ${id}`, colors: { background: "#FFCE00", text: "#000000" }, stops,
});

const lines = [
  line("1", [stop("Nation", 12, "Paris"), stop("Bastille", 4, "Paris"), stop("La Défense", 92, "Puteaux")]),
  line("2", [stop("Nation", 12, "Paris"), stop("Anvers", 9, "Paris")]),
];
const found = new Set(["nation", "la défense"]);

describe("progressBy", () => {
  it("lists each station once overall, line after line", () => {
    expect(progressBy(lines, found, "global")).toEqual([{ label: "Total", stations: [true, false, true, false] }]);
  });

  it("lists stations along each line, in line order, with the line colors", () => {
    expect(progressBy(lines, found, "line")).toEqual([
      { label: "Métro 1", stations: [true, false, true], color: "#FFCE00" },
      { label: "Métro 2", stations: [true, false], color: "#FFCE00" },
    ]);
  });

  it("counts per Paris arrondissement, then per département outside Paris", () => {
    expect(progressBy(lines, found, "arrondissement").map((g) => [g.label, g.stations])).toEqual([
      ["Paris 4e", [false]],
      ["Paris 9e", [false]],
      ["Paris 12e", [true]],
      ["Hors Paris (92)", [true]],
    ]);
  });

  it("names the first arrondissement 1er", () => {
    const first = [line("1", [stop("Louvre - Rivoli", 1, "Paris")])];
    expect(progressBy(first, new Set(), "arrondissement")[0].label).toBe("Paris 1er");
  });

  it("counts per commune, alphabetically", () => {
    expect(progressBy(lines, found, "commune").map((g) => [g.label, g.stations])).toEqual([
      ["Paris", [true, false, false]],
      ["Puteaux", [true]],
    ]);
  });
});
