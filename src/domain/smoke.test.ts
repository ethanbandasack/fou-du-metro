import { describe, expect, it } from "vitest";
import { formatTime } from "@/utils/metroUtils";

describe("test setup", () => {
  it("resolves the @ alias", () => {
    expect(formatTime(65)).toBe("1:05");
  });
});
