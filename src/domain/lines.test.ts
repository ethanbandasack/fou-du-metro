import { describe, expect, it } from "vitest";
import { compareLines, isMetroLine, lineColors, lineLabel, normalizeLineId } from "@/domain/lines";

describe("normalizeLineId", () => {
  it.each([
    ["3B", "3bis"],
    ["3BIS", "3bis"],
    ["7B", "7bis"],
    ["7bis", "7bis"],
    ["T3a", "T3a"],
    [" A ", "A"],
  ])("maps %s to %s", (raw, expected) => {
    expect(normalizeLineId(raw)).toBe(expected);
  });
});

describe("lineColors", () => {
  it("returns the official IDFM colors of a known line", () => {
    expect(lineColors("1")).toEqual({ background: "#FFCE00", text: "#000000" });
    expect(lineColors("A")).toEqual({ background: "#E3051C", text: "#FFFFFF" });
  });

  it("knows the bis lines", () => {
    expect(lineColors("3bis").background).toBe("#98D4E2");
    expect(lineColors("7bis").background).toBe("#83C491");
  });

  it("falls back to neutral gray for unknown lines", () => {
    expect(lineColors("TER Normandie")).toEqual({ background: "#666666", text: "#FFFFFF" });
  });
});

describe("compareLines", () => {
  it("orders by mode first, then by natural line id", () => {
    const lines = [
      { mode: "RER", id: "B" },
      { mode: "TRAMWAY", id: "T10" },
      { mode: "METRO", id: "3bis" },
      { mode: "METRO", id: "14" },
      { mode: "TRAMWAY", id: "T2" },
      { mode: "METRO", id: "3" },
      { mode: "TRAIN", id: "TER Normandie" },
      { mode: "RER", id: "A" },
    ] as const;
    const sorted = [...lines].sort(compareLines).map((l) => l.id);
    expect(sorted).toEqual(["3", "3bis", "14", "T2", "T10", "A", "B", "TER Normandie"]);
  });
});

describe("lineLabel", () => {
  it("prefixes the id with a French mode name", () => {
    expect(lineLabel("METRO", "1")).toBe("Métro 1");
    expect(lineLabel("TRAMWAY", "T3a")).toBe("Tramway T3a");
    expect(lineLabel("CABLE", "C1")).toBe("Câble C1");
  });
});

describe("isMetroLine", () => {
  it("recognises numbered and bis metro lines only", () => {
    expect(["1", "14", "3bis", "7bis"].every(isMetroLine)).toBe(true);
    expect(["A", "T1", "C1", "TER Normandie"].some(isMetroLine)).toBe(false);
  });
});
