import { describe, expect, it } from "vitest";
import { formatDuration } from "@/domain/format";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [65, "1:05"],
    [3600, "60:00"],
  ])("formats %i seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
