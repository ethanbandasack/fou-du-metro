import { describe, expect, it } from "vitest";
import { render, visibleRows, type Screen } from "@/tui/render";
import { initialTuiState } from "@/tui/state";

const screen = (overrides: Partial<Screen> = {}): Screen => ({
  state: { ...initialTuiState("line"), input: "bas" },
  groups: [
    { label: "Métro 1", found: 5, total: 25 },
    { label: "Métro 2", found: 25, total: 25 },
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
    const groups = Array.from({ length: 20 }, (_, i) => ({ label: `L${i}`, found: 0, total: 1 }));
    const lines = render(screen({ groups }));
    expect(lines.some((line) => line.includes("↓ 15 de plus"))).toBe(true);
  });

  it("colors line bars when asked", () => {
    const lines = render(screen({ color: true, groups: [{ label: "Métro 1", found: 5, total: 25, color: "#FFCE00" }] }));
    expect(lines.join("\n")).toContain("\x1b[38;2;255;206;0m");
  });
});

describe("visibleRows", () => {
  it("leaves room for the header, separators, feedback, input and help", () => {
    expect(visibleRows(12)).toBe(6);
    expect(visibleRows(3)).toBe(1);
  });
});
