import { describe, expect, it } from "vitest";
import { parseListenLine } from "@/tui/voice";

describe("parseListenLine", () => {
  it("reads the listener's events", () => {
    expect(parseListenLine("ready")).toEqual({ type: "ready" });
    expect(parseListenLine("heard\tNation et Bastille")).toEqual({ type: "heard", transcript: "Nation et Bastille" });
    expect(parseListenLine("error\tMicro refusé")).toEqual({ type: "error", message: "Micro refusé" });
  });

  it("ignores anything else", () => {
    expect(parseListenLine("")).toBeNull();
    expect(parseListenLine("2026-11-12 warning")).toBeNull();
  });
});
