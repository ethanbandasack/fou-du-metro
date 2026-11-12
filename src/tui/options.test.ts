import { describe, expect, it } from "vitest";
import { parseOptions } from "@/tui/options";

describe("parseOptions", () => {
  it("plays the metro, grouped by line, in color by default", () => {
    expect(parseOptions([], {})).toEqual({ modes: ["METRO"], lines: [], grouping: "line", color: true, help: false });
  });

  it("reads modes, lines and grouping (French or English names)", () => {
    const options = parseOptions(["--modes", "metro,rer", "--lines", "1,3B,A", "--group", "ville"], {});
    expect(options).toMatchObject({ modes: ["METRO", "RER"], lines: ["1", "3bis", "A"], grouping: "commune" });
  });

  it("plays the whole network with --modes all", () => {
    expect(parseOptions(["--modes", "all"], {}).modes).toEqual([]);
  });

  it("disables colors with --no-color or NO_COLOR", () => {
    expect(parseOptions(["--no-color"], {}).color).toBe(false);
    expect(parseOptions([], { NO_COLOR: "1" }).color).toBe(false);
  });

  it("rejects unknown values with a helpful message", () => {
    expect(() => parseOptions(["--modes", "bus"], {})).toThrow(/bus/);
    expect(() => parseOptions(["--group", "planet"], {})).toThrow(/planet/);
  });
});
