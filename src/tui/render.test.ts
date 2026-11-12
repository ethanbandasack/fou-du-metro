import { describe, expect, it } from "vitest";
import { render, stationBar, visibleRows, type Screen } from "@/tui/render";
import { initialTuiState } from "@/tui/state";

/** `found` stations found out of `total`, the found ones first. */
const flags = (found: number, total: number) => Array.from({ length: total }, (_, i) => i < found);

const screen = (overrides: Partial<Screen> = {}): Screen => ({
  state: { ...initialTuiState("line"), input: "bas" },
  groups: [
    { label: "Métro 1", stations: flags(5, 25) },
    { label: "Métro 2", stations: flags(25, 25) },
  ],
  title: "Métro",
  found: 30,
  total: 321,
  elapsedSeconds: 75,
  lastFoundNames: ["Nation"],
  width: 60,
  height: 12,
  color: false,
  ...overrides,
});

describe("render", () => {
  it("fills the screen exactly, every line within the width", () => {
    const lines = render(screen());
    expect(lines).toHaveLength(12);
    expect(lines.every((line) => line.length <= 60)).toBe(true);
  });

  it("stays within narrow terminals", () => {
    const lines = render(screen({ width: 24, groups: [{ label: "Tramway T3a", stations: flags(120, 321) }] }));
    expect(lines.filter((line) => line.length > 24)).toEqual([]);
    expect(lines.find((line) => line.includes("120 / 321"))).toBeDefined();
  });

  it("shows overall progress, time and grouping in the header", () => {
    const [header] = render(screen());
    expect(header).toContain("30 / 321 (9 %)");
    expect(header).toContain("1:15");
    expect(header).toContain("Ligne");
  });

  it("shows only counts and a bar per group, never station names", () => {
    const lines = render(screen());
    const row = lines.find((line) => line.startsWith(" Métro 1"))!;
    expect(row).toMatch(/█+░+/);
    expect(row.trimEnd()).toMatch(/5 \/ 25$/);
  });

  it("shows the latest find and the input", () => {
    const lines = render(screen());
    expect(lines).toContain(" ✓ Nation");
    expect(lines.some((line) => line.startsWith(" > bas"))).toBe(true);
  });

  it("says when more groups are below", () => {
    const groups = Array.from({ length: 20 }, (_, i) => ({ label: `L${i}`, stations: [false] }));
    const lines = render(screen({ groups }));
    expect(lines.some((line) => line.includes("↓ 15 de plus"))).toBe(true);
  });

  it("colors line bars when asked", () => {
    const lines = render(screen({ color: true, groups: [{ label: "Métro 1", stations: flags(5, 25), color: "#FFCE00" }] }));
    expect(lines.join("\n")).toContain("\x1b[38;2;255;206;0m");
  });
});

describe("stationBar", () => {
  it("draws each station at its relative position along the bar", () => {
    expect(stationBar([true, false, false, true], 8)).toBe("██░░░░██");
  });

  it("gives every station a cell when the bar is not a multiple of the station count", () => {
    expect(stationBar([false, true, false], 4)).toBe("░░█░");
  });

  it("shades a cell holding found and missing stations when stations outnumber cells", () => {
    expect(stationBar([true, true, false, false, true, false, false, false], 4)).toBe("█░▒░");
  });
});

describe("visibleRows", () => {
  it("leaves room for the header, separators, feedback, input and help", () => {
    expect(visibleRows(12)).toBe(6);
    expect(visibleRows(3)).toBe(1);
  });
});
