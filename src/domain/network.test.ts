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
    hasRer: false,
    hasTram: false,
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
    const { lines } = buildNetwork({ rows, lineOrders: [order("1", ["a", "B"])], aliases: [] });
    expect(lines[0].stops.map((s) => [s.name, s.order])).toEqual([
      ["A", 1],
      ["B", 2],
    ]);
  });

  it("gives each line its label and colors, sorted by mode then id", () => {
    const rows = [row("X", "A", { mode: "RER" }), row("Y", "14", { lat: 40 }), row("Z", "3bis", { lat: 41 })];
    const { lines } = buildNetwork({
      rows,
      lineOrders: [order("A", ["X"], "RER"), order("14", ["Y"]), order("3bis", ["Z"])],
      aliases: [],
    });
    expect(lines.map((l) => l.label)).toEqual(["Métro 3bis", "Métro 14", "RER A"]);
    expect(lines[2].colors.background).toBe("#E3051C");
  });

  it("groups nearby stops with the same name into one station", () => {
    const rows = [row("Nation", "1"), row("Nation", "2", { lat: 48.851 }), row("Nation", "6", { lat: 49.5 })];
    const { stations } = buildNetwork({ rows, lineOrders: [], aliases: [] });
    expect(stations.map((s) => s.lines)).toEqual([["1", "2"], ["6"]]);
  });

  it("groups declared aliases and records every name", () => {
    const rows = [row("Saint-Lazare", "3"), row("Haussmann Saint-Lazare", "E", { mode: "RER" })];
    const { stations } = buildNetwork({
      rows,
      lineOrders: [],
      aliases: [{ name1: "Saint-Lazare", name2: "Haussmann Saint-Lazare" }],
    });
    expect(stations).toHaveLength(1);
    expect(stations[0].aliases).toEqual(["Saint-Lazare", "Haussmann Saint-Lazare"]);
  });

  it("lists connections, keeping RER and tram lines only when the stop is flagged", () => {
    const rows = [
      row("Châtelet", "1", { hasRer: true }),
      row("Châtelet", "4"),
      row("Châtelet", "A", { mode: "RER" }),
      row("Châtelet", "T9", { mode: "TRAMWAY" }),
    ];
    const { lines } = buildNetwork({
      rows,
      lineOrders: [order("1", ["Châtelet"]), order("4", ["Châtelet"])],
      aliases: [],
    });
    const connectionsOf = (lineId: string) => lines.find((l) => l.id === lineId)!.stops[0].connections;
    expect(connectionsOf("1")).toEqual(["4", "A"]);
    expect(connectionsOf("4")).toEqual(["1"]);
  });

  it("merges the RER and tram flags of a station across its rows", () => {
    const rows = [row("Gare", "1"), row("Gare", "2", { hasRer: true, hasTram: true })];
    const { stations } = buildNetwork({ rows, lineOrders: [], aliases: [] });
    expect(stations[0]).toMatchObject({ hasRer: true, hasTram: true });
  });
});
