import { describe, expect, it } from "vitest";
import { parseFlag } from "@/hooks/useHardcore";

describe("parseFlag", () => {
  it("is on only for a stored true", () => {
    expect(parseFlag("true")).toBe(true);
    expect(parseFlag("false")).toBe(false);
    expect(parseFlag(null)).toBe(false);
    expect(parseFlag("garbage")).toBe(false);
  });
});
