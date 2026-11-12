import { describe, expect, it } from "vitest";
import type { Station } from "@/domain/network";
import { buildCategories, categoryFilter, findTargets, suggestStations } from "@/features/intersection/categories";

const station = (name: string, overrides: Partial<Station> = {}): Station => ({
  name,
  aliases: [name],
  lines: ["1"],
  lat: 0,
  lon: 0,
  arrondissement: 1,
  historicFigure: false,
  colorInName: false,
  openedAfter1980: false,
  leftBank: false,
  hasRer: false,
  hasTram: false,
  opening: null,
  ...overrides,
});

const stations = [
  station("Nation", { lines: ["1", "2", "6", "9", "A"], arrondissement: 12, hasRer: true }),
  station("Bastille", { lines: ["1", "5", "8"], arrondissement: 4 }),
  station("Cité", { lines: ["4"], arrondissement: 4 }),
  station("Gambetta", { lines: ["3", "3bis"], arrondissement: 20 }),
  station("La Défense", { lines: ["1", "A"], arrondissement: 92 }),
];
const categories = buildCategories(stations);
const byId = (id: string) => Object.values(categories).flat().find((c) => c.id === id)!;
const names = (filter: (s: Station) => boolean) => stations.filter(filter).map((s) => s.name);

describe("buildCategories", () => {
  it("offers one category per metro line, naturally sorted, with the line colors", () => {
    expect(categories.line.map((c) => c.name)).toEqual(["Métro 1", "Métro 2", "Métro 3", "Métro 3bis", "Métro 4", "Métro 5", "Métro 6", "Métro 8", "Métro 9"]);
    expect(byId("line-1").colors.background).toBe("#FFBE00");
  });

  it("filters by line, geography and arrondissement groups", () => {
    expect(names(byId("line-1").matches)).toEqual(["Nation", "Bastille", "La Défense"]);
    expect(names(byId("extra").matches)).toEqual(["La Défense"]);
    expect(names(byId("rd").matches)).toEqual(["Nation", "Bastille", "Gambetta"]);
    expect(names(byId("arr-group-1-9").matches)).toEqual(["Bastille", "Cité"]);
  });

  it("counts connections", () => {
    expect(names(byId("c1").matches)).toEqual(["Cité", "La Défense"]);
    expect(names(byId("has-rer").matches)).toEqual(["Nation"]);
  });
});

describe("categoryFilter", () => {
  it("reads a custom list of lines, case-insensitively", () => {
    expect(names(categoryFilter(byId("group-custom"), "4, 3BIS"))).toEqual(["Cité", "Gambetta"]);
  });

  it("reads a custom list of arrondissements", () => {
    expect(names(categoryFilter(byId("arr-custom"), "12 20"))).toEqual(["Nation", "Gambetta"]);
  });

  it("uses the category's own filter otherwise", () => {
    expect(names(categoryFilter(byId("arr-4"), "ignored"))).toEqual(["Bastille", "Cité"]);
  });
});

describe("findTargets", () => {
  it("keeps the stations matching every filter", () => {
    expect(findTargets(stations, [byId("line-1").matches, byId("intra").matches])).toEqual(["Nation", "Bastille"]);
  });
});

describe("suggestStations", () => {
  it("needs at least two characters", () => {
    expect(suggestStations(stations, "n")).toEqual([]);
  });

  it("lists names starting with the input first, then other matches alphabetically", () => {
    const result = suggestStations([...stations, station("Montparnasse"), station("Nationale")], "na");
    expect(result.map((s) => s.name)).toEqual(["Nation", "Nationale", "Montparnasse"]);
  });

  it("searches aliases and caps the list", () => {
    const aliased = station("Saint-Lazare", { aliases: ["Saint-Lazare", "Auber"] });
    expect(suggestStations([aliased], "aub").map((s) => s.name)).toEqual(["Saint-Lazare"]);
    expect(suggestStations(stations, "a", 2)).toHaveLength(0);
    expect(suggestStations(stations, "ti", 1)).toHaveLength(1);
  });
});
