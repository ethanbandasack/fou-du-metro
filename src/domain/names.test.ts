import { describe, expect, it } from "vitest";
import { createAliasMatcher, normalizeName, simplifyName } from "@/domain/names";

describe("normalizeName", () => {
  it("ignores case, accents, spaces and punctuation", () => {
    expect(normalizeName("Champs-Élysées - Clemenceau")).toBe("champselyseesclemenceau");
    expect(normalizeName("champs elysees clemenceau")).toBe("champselyseesclemenceau");
  });

  it("ignores a leading 'Gare de' / \"Gare d'\"", () => {
    expect(normalizeName("Gare de Lyon")).toBe("lyon");
    expect(normalizeName("Gare d'Austerlitz")).toBe("austerlitz");
    expect(normalizeName("Gare du Nord")).toBe("garedunord");
  });

  it("returns an empty string for empty input", () => {
    expect(normalizeName("")).toBe("");
  });
});

describe("simplifyName", () => {
  it("folds case, accents and punctuation but keeps 'Gare de'", () => {
    expect(simplifyName("Gare de l'Est")).toBe("garedelest");
  });
});

describe("createAliasMatcher", () => {
  const areAliases = createAliasMatcher([{ name1: "Saint-Lazare", name2: "Haussmann Saint-Lazare" }]);

  it("matches identical names", () => {
    expect(areAliases("Nation", "Nation")).toBe(true);
  });

  it("treats hyphens and ' - ' as spaces, case-insensitively", () => {
    expect(areAliases("Viroflay - Rive Gauche", "viroflay rive gauche")).toBe(true);
  });

  it("matches declared pairs in both directions", () => {
    expect(areAliases("Saint-Lazare", "Haussmann Saint-Lazare")).toBe(true);
    expect(areAliases("haussmann saint lazare", "SAINT-LAZARE")).toBe(true);
  });

  it("rejects unrelated names", () => {
    expect(areAliases("Saint-Lazare", "Nation")).toBe(false);
  });
});
