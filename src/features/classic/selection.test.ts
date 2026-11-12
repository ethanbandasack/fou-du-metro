import { describe, expect, it } from "vitest";
import type { Line, Stop } from "@/domain/network";
import { answersOf, selectLines } from "@/features/classic/selection";

const stop = (name: string, key = name.toLowerCase()): Stop => ({
  id: name, key, name, lineId: "", mode: "METRO", order: 1, lat: 0, lon: 0, arrondissement: 1, connections: [],
});
const line = (id: string, mode: Line["mode"], stops: Stop[] = []): Line => ({
  id, mode, label: id, colors: { background: "", text: "" }, stops,
});

describe("selectLines", () => {
  const lines = [line("1", "METRO"), line("2", "METRO"), line("A", "RER")];

  it("keeps lines of the selected modes", () => {
    expect(selectLines(lines, { selectedModes: ["RER"], selectedLines: [] }).map((l) => l.id)).toEqual(["A"]);
  });

  it("narrows to the selected lines when some are picked", () => {
    expect(selectLines(lines, { selectedModes: ["METRO"], selectedLines: ["2", "A"] }).map((l) => l.id)).toEqual(["2"]);
  });

  it("treats an empty mode selection as every mode", () => {
    expect(selectLines(lines, { selectedModes: [], selectedLines: [] })).toHaveLength(3);
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
