import { describe, expect, it } from "vitest";
import { normalizeName, simplifyName } from "@/domain/names";

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
