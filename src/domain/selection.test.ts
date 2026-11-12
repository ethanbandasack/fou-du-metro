import { describe, expect, it } from "vitest";
import type { Line, Station, Stop } from "@/domain/network";
import { answersOf, openLineIds, openStations, selectLines } from "@/domain/selection";

const stop = (name: string, key = name.toLowerCase()): Stop => ({
  id: name, key, name, lineId: "", mode: "METRO", order: 1, lat: 0, lon: 0, arrondissement: 1, commune: "Paris", opening: null, connections: [],
});
const line = (id: string, mode: Line["mode"], stops: Stop[] = []): Line => ({
  id, mode, label: id, colors: { background: "", text: "" }, stops,
});

describe("selectLines", () => {
  const lines = [line("1", "METRO", [stop("Nation")]), line("2", "METRO", [stop("Anvers")]), line("A", "RER", [stop("Auber")])];

  it("keeps lines of the selected modes", () => {
    expect(selectLines(lines, { selectedModes: ["RER"], selectedLines: [], includeFuture: false, today: "2026-11-12" }).map((l) => l.id)).toEqual(["A"]);
  });

  it("narrows to the selected lines when some are picked", () => {
    expect(selectLines(lines, { selectedModes: ["METRO"], selectedLines: ["2", "A"], includeFuture: false, today: "2026-11-12" }).map((l) => l.id)).toEqual(["2"]);
  });

  it("treats an empty mode selection as every mode", () => {
    expect(selectLines(lines, { selectedModes: [], selectedLines: [], includeFuture: false, today: "2026-11-12" })).toHaveLength(3);
  });
});

describe("answersOf", () => {
  it("returns one answer per key with every spelling of it", () => {
    const lines = [line("1", "METRO", [stop("Nation"), stop("Bastille")]), line("2", "METRO", [stop("Nation")])];
    expect(answersOf(lines)).toEqual([
      { key: "nation", names: ["Nation"] },
      { key: "bastille", names: ["Bastille"] },
    ]);
  });
});

describe("future stations", () => {
  const future = (name: string, opening: string): Stop => ({ ...stop(name), opening });
  const lines = [
    line("1", "METRO", [stop("Nation"), future("Val de Fontenay", "2030-12-31")]),
    line("18", "METRO", [future("Polytechnique", "2026-12-01")]),
  ];

  it("plays only stations open on the given day by default", () => {
    const selected = selectLines(lines, { selectedModes: [], selectedLines: [], includeFuture: false, today: "2026-11-12" });
    expect(selected.map((l) => [l.id, l.stops.map((s) => s.name)])).toEqual([["1", ["Nation"]]]);
  });

  it("counts a station opened on or before today as open", () => {
    const selected = selectLines(lines, { selectedModes: [], selectedLines: [], includeFuture: false, today: "2026-12-01" });
    expect(selected.map((l) => l.id)).toEqual(["1", "18"]);
  });

  it("plays every station when future ones are included", () => {
    const selected = selectLines(lines, { selectedModes: [], selectedLines: [], includeFuture: true, today: "2026-11-12" });
    expect(selected.flatMap((l) => l.stops)).toHaveLength(3);
  });

  it("lists the lines with at least one open station", () => {
    expect([...openLineIds(lines, "2026-11-12")]).toEqual(["1"]);
  });
});

describe("openStations", () => {
  const station = (name: string, lines: string[], opening: string | null = null): Station => ({
    name, aliases: [name], lines, lat: 0, lon: 0, arrondissement: 1, historicFigure: false, colorInName: false,
    openedAfter1980: false, leftBank: false, hasRer: false, hasTram: false, opening,
  });
  const lines = [
    line("9", "METRO", [stop("Pont de Sèvres")]),
    line("15", "METRO", [{ ...stop("Pont de Sèvres"), lineId: "15", opening: "2027-12-31" }]),
  ];

  it("drops future stations and the future lines of open ones", () => {
    const stations = [station("Pont de Sèvres", ["9", "15"]), station("Bagneux", ["15"], "2027-12-31")];
    expect(openStations(stations, lines, "2026-11-12").map((s) => [s.name, s.lines])).toEqual([["Pont de Sèvres", ["9"]]]);
  });
});
