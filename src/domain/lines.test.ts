import { describe, expect, it } from "vitest";
import { compareLines, isMetroLine, lineColors, lineLabel, lineShortId, normalizeLineId } from "@/domain/lines";

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
  it("returns the official IDFM web colors (referentiel-des-lignes)", () => {
    expect(lineColors("1")).toEqual({ background: "#FFBE00", text: "#000000" });
    expect(lineColors("A")).toEqual({ background: "#EB2132", text: "#FFFFFF" });
    expect(lineColors("T6")).toEqual({ background: "#FF0000", text: "#FFFFFF" });
    expect(lineColors("H")).toEqual({ background: "#84653D", text: "#FFFFFF" });
  });

  it("knows the bis lines, shuttles and the cable car", () => {
    expect(lineColors("3bis").background).toBe("#82C8E6");
    expect(lineColors("7bis").background).toBe("#82DC73");
    expect(lineColors("CDG VAL").background).toBe("#5CC5ED");
    expect(lineColors("FUNICULAIRE")).toEqual({ background: "#AFAFAF", text: "#000000" });
    expect(lineColors("C1").background).toBe("#3C91DC");
  });

  it("gives every TER line the official TER gray", () => {
    expect(lineColors("TER Normandie")).toEqual({ background: "#AAAAAA", text: "#000000" });
  });

  it("falls back to neutral gray for unknown lines", () => {
    expect(lineColors("Z42")).toEqual({ background: "#666666", text: "#FFFFFF" });
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

describe("lineShortId", () => {
  it.each([
    ["TER Hauts-de-France", "TER"],
    ["CDG VAL", "CDG"],
    ["ORLYVAL", "Orly"],
    ["FUNICULAIRE", "Funi"],
    ["3bis", "3bis"],
    ["T3a", "T3a"],
  ])("shortens %s to %s", (id, expected) => {
    expect(lineShortId(id)).toBe(expected);
  });
});

describe("lines under construction", () => {
  it("use the colors of the IDFM project data", () => {
    expect(lineColors("15")).toEqual({ background: "#A50034", text: "#FFFFFF" });
    expect(lineColors("16")).toEqual({ background: "#FF82B4", text: "#000000" });
    expect(lineColors("17")).toEqual({ background: "#D2D200", text: "#000000" });
  });
});
