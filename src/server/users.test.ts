import { describe, expect, it } from "vitest";
import { findPlayerByCode } from "@/server/users";

const users = [{ id: "1", username: "ana", hash: "abc123", createdAt: "2025-01-01" }];

describe("findPlayerByCode", () => {
  it("returns the public profile for a known code, ignoring surrounding spaces", () => {
    expect(findPlayerByCode(users, "  abc123 ")).toEqual({ id: "1", username: "ana" });
  });

  it("returns null for an unknown or empty code", () => {
    expect(findPlayerByCode(users, "nope")).toBeNull();
    expect(findPlayerByCode(users, "")).toBeNull();
  });
});
