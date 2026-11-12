import { describe, expect, it } from "vitest";
import { exactForm, normalizeName, phoneticKey, simplifyName } from "@/domain/names";

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

describe("exactForm", () => {
  it("ignores case, spaces and punctuation but keeps accents and every word", () => {
    expect(exactForm("Champs-Élysées - Clemenceau")).toBe("champsélyséesclemenceau");
    expect(exactForm("Gare de l'Est")).toBe("garedelest");
    expect(exactForm("Saint-Paul (Le Marais)")).toBe("saintpaullemarais");
  });

  it("treats composed and decomposed accents alike", () => {
    expect(exactForm("Étoile")).toBe(exactForm("Étoile"));
  });
});

describe("phoneticKey", () => {
  const same = (a: string, b: string) => expect(phoneticKey(a)).toBe(phoneticKey(b));

  it("ignores silent endings, so plural or not sounds the same", () => {
    same("Invalides", "invalide");
    same("Porte de Vanves", "porte de vanve");
    same("Les Halles", "les hall");
    same("Gobelins", "Gobelin");
    same("Corvisart", "corvisar");
  });

  it("merges spellings of one sound", () => {
    same("Rambuteau", "Rambuto");
    same("Jaurès", "Jorès");
    same("Pernety", "Pernetti");
    same("Philippe Auguste", "Filip Ogust");
    same("Quatre-Septembre", "katre septanbre");
    same("Parmentier", "parmantié");
    same("Bérault", "Bérot");
  });

  it("ignores punctuation and how words are cut", () => {
    same("Bonne-Nouvelle", "bonne nouvelle");
    same("Corvisart", "Corvi sart");
  });

  it("keeps different sounds apart", () => {
    expect(phoneticKey("Nation")).not.toBe(phoneticKey("Nationale"));
    expect(phoneticKey("Bastille")).not.toBe(phoneticKey("Bastia"));
    expect(phoneticKey("Gaîté")).not.toBe(phoneticKey("je"));
  });
});
