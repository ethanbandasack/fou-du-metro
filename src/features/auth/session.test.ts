import { describe, expect, it } from "vitest";
import { parseStoredPlayer } from "@/features/auth/session";

describe("parseStoredPlayer", () => {
  it("returns null when nobody is logged in", () => {
    expect(parseStoredPlayer(null)).toBeNull();
    expect(parseStoredPlayer("not json")).toBeNull();
    expect(parseStoredPlayer('{"isAuthenticated":false,"user":null}')).toBeNull();
  });

  it("reads the legacy auth state and drops the stored code", () => {
    const legacy = { isAuthenticated: true, user: { id: "7", username: "ana", hash: "secret", createdAt: "2025" } };
    expect(parseStoredPlayer(JSON.stringify(legacy))).toEqual({ id: "7", username: "ana" });
  });

  it("reads the current format", () => {
    expect(parseStoredPlayer('{"id":"7","username":"ana"}')).toEqual({ id: "7", username: "ana" });
  });
});
