import { describe, expect, it } from "vitest";
import type { StopRow } from "@/domain/csv";
import { buildNetwork, type LineOrder } from "@/domain/network";

function row(name: string, lineId: string, overrides: Partial<StopRow> = {}): StopRow {
  return {
    name,
    lineId,
    mode: "METRO",
    order: 0,
    lat: 48.85,
    lon: 2.35,
    arrondissement: 1,
    historicFigure: false,
    colorInName: false,
    openedAfter1980: false,
    leftBank: false,
    commune: "Paris",
    zone: "",
    ...overrides,
  };
}

const order = (lineId: string, stations: string[], mode: LineOrder["mode"] = "METRO"): LineOrder => ({
  lineId,
  mode,
  stations,
});

describe("buildNetwork", () => {
  it("orders the stops of a line by its YAML list and drops unlisted stops", () => {
    const rows = [row("B", "1", { lat: 48.0 }), row("A", "1", { lat: 48.1 }), row("Ghost", "1", { lat: 48.2 })];
    const { lines } = buildNetwork({ rows, lineOrders: [order("1", ["a", "B"])], corridors: [] });
    expect(lines[0].stops.map((s) => [s.name, s.order])).toEqual([
      ["A", 1],
      ["B", 2],
    ]);
  });

  it("keeps where each stop is", () => {
    const rows = [row("Saint-Denis - Porte de Paris", "13", { arrondissement: 93, commune: "Saint-Denis" })];
    const { lines } = buildNetwork({ rows, lineOrders: [order("13", ["Saint-Denis - Porte de Paris"])], corridors: [] });
    expect(lines[0].stops[0]).toMatchObject({ arrondissement: 93, commune: "Saint-Denis" });
  });

  it("gives each line its label and colors, sorted by mode then id", () => {
    const rows = [row("X", "A", { mode: "RER" }), row("Y", "14", { lat: 40 }), row("Z", "3bis", { lat: 41 })];
    const { lines } = buildNetwork({
      rows,
      lineOrders: [order("A", ["X"], "RER"), order("14", ["Y"]), order("3bis", ["Z"])],
      corridors: [],
    });
    expect(lines.map((l) => l.label)).toEqual(["Métro 3bis", "Métro 14", "RER A"]);
    expect(lines[2].colors.background).toBe("#EB2132");
  });

  it("groups the stops of one official transfer zone into one station", () => {
    const rows = [
      row("Saint-Lazare", "3", { zone: "z1" }),
      row("Paris Saint-Lazare", "J", { mode: "TRANSILIEN", zone: "z1", lat: 48.876 }),
      row("Haussmann Saint-Lazare", "E", { mode: "RER", zone: "z2" }),
    ];
    const { stations } = buildNetwork({ rows, lineOrders: [], corridors: [] });
    expect(stations.map((s) => [s.name, s.aliases, s.lines])).toEqual([
      ["Saint-Lazare", ["Saint-Lazare", "Paris Saint-Lazare"], ["3", "J"]],
      ["Haussmann Saint-Lazare", ["Haussmann Saint-Lazare"], ["E"]],
    ]);
  });

  it("without a zone, groups nearby stops with the same name", () => {
    const rows = [row("Nation", "1"), row("Nation", "2", { lat: 48.851 }), row("Nation", "6", { lat: 49.5 })];
    const { stations } = buildNetwork({ rows, lineOrders: [], corridors: [] });
    expect(stations.map((s) => s.lines)).toEqual([["1", "2"], ["6"]]);
  });

  it("lists the other lines of the zone as connections", () => {
    const rows = [
      row("Châtelet", "1", { zone: "z1" }),
      row("Châtelet", "4", { zone: "z1" }),
      row("Châtelet - Les Halles", "A", { mode: "RER", zone: "z2" }),
    ];
    const { lines } = buildNetwork({ rows, lineOrders: [order("1", ["Châtelet"]), order("4", ["Châtelet"])], corridors: [] });
    expect(lines.map((l) => l.stops[0].connections)).toEqual([["4"], ["1"]]);
  });

  it("adds the lines across a corridor without merging the stations", () => {
    const rows = [row("Opéra", "3", { zone: "z1" }), row("Auber", "A", { mode: "RER", zone: "z2", lon: 2.351 })];
    const network = buildNetwork({
      rows,
      lineOrders: [order("3", ["Opéra"])],
      corridors: [{ name1: "Opéra", name2: "Auber" }],
    });
    expect(network.lines[0].stops[0].connections).toEqual(["A"]);
    expect(network.stations.map((s) => [s.name, s.lines, s.hasRer])).toEqual([
      ["Opéra", ["3"], true],
      ["Auber", ["A"], true],
    ]);
  });

  it("ignores a corridor between far-apart stations", () => {
    const rows = [row("Opéra", "3", { zone: "z1" }), row("Auber", "A", { mode: "RER", zone: "z2", lat: 49 })];
    const { stations } = buildNetwork({ rows, lineOrders: [], corridors: [{ name1: "Opéra", name2: "Auber" }] });
    expect(stations[0].hasRer).toBe(false);
  });

  it("derives tram connections from the lines of the zone", () => {
    const rows = [row("Porte de Vincennes", "1", { zone: "z1" }), row("Porte de Vincennes", "T3a", { mode: "TRAMWAY", zone: "z1" })];
    const { stations } = buildNetwork({ rows, lineOrders: [], corridors: [] });
    expect(stations[0]).toMatchObject({ hasTram: true, hasRer: false });
  });
});
