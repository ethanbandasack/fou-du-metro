import { describe, expect, it } from "vitest";
import { isMetroLine } from "@/domain/lines";
import { loadNetwork } from "@/server/loadNetwork";

// Characterization of the real dataset. Update the values on purpose when src/data changes.
describe("loadNetwork (real data)", () => {
  const network = loadNetwork();
  const stop = (lineId: string, name: string) =>
    network.lines.find((l) => l.id === lineId)?.stops.find((s) => s.name === name);

  it("loads every line and stop, one station per official transfer zone", () => {
    expect(network.lines).toHaveLength(55);
    expect(network.lines.flatMap((l) => l.stops)).toHaveLength(1283);
    // Every row has an official zone: one station per zone
    expect(network.stations).toHaveLength(999);
  });

  it("orders stops along the line and lists the lines of the zone, then across corridors", () => {
    expect(stop("1", "Châtelet")).toMatchObject({ order: 15, connections: ["4", "7", "11", "14", "A", "B", "D"] });
    expect(stop("2", "Nation")).toMatchObject({ order: 1, connections: ["1", "6", "9", "A"] });
    expect(stop("5", "Porte de Pantin")?.connections).toEqual(["T3b"]);
  });

  it("normalizes bis lines", () => {
    expect(stop("3bis", "Gambetta")).toMatchObject({ order: 1, connections: ["3"] });
  });

  it("keeps stations linked by a corridor distinct", () => {
    const saintLazare = network.stations.find((s) => s.name === "Saint-Lazare");
    expect(saintLazare).toMatchObject({ lines: ["3", "12", "13", "14", "J", "L", "TER Normandie"], hasRer: true });
    const metroStations = new Set(network.stations.filter((s) => s.lines.some(isMetroLine)).map((s) => s.name));
    expect(["Gare du Nord", "La Chapelle", "Abbesses", "Anvers", "Le Peletier", "Notre-Dame-de-Lorette"].filter((n) => !metroStations.has(n))).toEqual([]);
  });
});
