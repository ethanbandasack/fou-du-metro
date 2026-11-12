import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, parseStoredSettings } from "@/features/classic/settings";

describe("parseStoredSettings", () => {
  it("falls back to the defaults when nothing valid is stored", () => {
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings("garbage")).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid fields and defaults the others", () => {
    const stored = JSON.stringify({ selectedModes: ["RER"], selectedLines: "oops", showConnections: false });
    expect(parseStoredSettings(stored)).toEqual({ ...DEFAULT_SETTINGS, selectedModes: ["RER"], showConnections: false });
  });
});
