import { describe, expect, it } from "vitest";
import { loadNetwork } from "@/server/loadNetwork";

// Characterization of the real dataset (values captured before the refactor).
describe("loadNetwork (real data)", () => {
  const network = loadNetwork();
  const stop = (lineId: string, name: string) =>
    network.lines.find((l) => l.id === lineId)?.stops.find((s) => s.name === name);

  it("loads every line, stop and station", () => {
    expect(network.lines).toHaveLength(54);
    expect(network.lines.flatMap((l) => l.stops)).toHaveLength(1279);
    expect(network.stations).toHaveLength(983);
  });

  it("orders stops along the line and computes connections", () => {
    expect(stop("1", "Châtelet")).toMatchObject({ order: 15, connections: ["4", "7", "11", "14"] });
    expect(stop("2", "Nation")).toMatchObject({ order: 1, connections: ["1", "6", "9", "A"] });
  });

  it("normalizes bis lines", () => {
    expect(stop("3bis", "Gambetta")).toMatchObject({ order: 1, connections: ["3"] });
  });

  it("merges declared aliases into one station", () => {
    const saintLazare = network.stations.find((s) => s.name === "Saint-Lazare");
    expect(saintLazare?.lines).toEqual(["3", "12", "13", "14", "A", "E"]);
  });
});
