import { describe, expect, it } from "vitest";
import { addScore, createScore, MAX_SCORES, parseStoredScores } from "@/features/classic/scores";

const score = (id: string) =>
  createScore({ id, found: 5, total: 10, elapsedSeconds: 42, modes: ["METRO"], lines: [], username: "ana", hardcore: true, date: new Date(0) });

describe("createScore", () => {
  it("computes the rounded percentage and stores the date as ISO text", () => {
    expect(score("1")).toEqual({
      id: "1",
      score: 5,
      totalStations: 10,
      timeElapsed: 42,
      percentage: 50,
      date: "1970-01-01T00:00:00.000Z",
      modes: ["METRO"],
      lines: [],
      username: "ana",
      hardcore: true,
    });
  });
});

describe("addScore", () => {
  it("puts the newest score first and keeps the last ten", () => {
    const scores = Array.from({ length: MAX_SCORES }, (_, i) => score(String(i)));
    const result = addScore(scores, score("new"));
    expect(result).toHaveLength(MAX_SCORES);
    expect(result[0].id).toBe("new");
    expect(result.at(-1)?.id).toBe("8");
  });
});

describe("parseStoredScores", () => {
  it("returns an empty list for missing or corrupt data", () => {
    expect(parseStoredScores(null)).toEqual([]);
    expect(parseStoredScores("{oops")).toEqual([]);
    expect(parseStoredScores('{"not":"a list"}')).toEqual([]);
  });

  it("reads scores saved before usernames existed", () => {
    const legacy = { ...score("1"), username: undefined };
    expect(parseStoredScores(JSON.stringify([legacy]))[0].username).toBe("Inconnu");
  });
});
