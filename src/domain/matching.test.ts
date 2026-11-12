import { describe, expect, it } from "vitest";
import { buildAnswerIndex, findMentionedAnswers, lookupAnswer } from "@/domain/matching";

const index = buildAnswerIndex(
  [
    "Saint-Paul (Le Marais)",
    "Saint-Lazare",
    "Charles de Gaulle - Étoile",
    "Bobigny - Pablo Picasso",
    "Bobigny - Pantin - Raymond Queneau",
    "Porte Maillot",
    "Neuilly - Porte Maillot",
    "Gare de Lyon",
  ].map((name) => ({ key: name, names: [name] })),
);

describe("lookupAnswer", () => {
  it("matches a full name regardless of case, accents and punctuation", () => {
    expect(lookupAnswer(index, "charles de gaulle etoile")).toEqual(["Charles de Gaulle - Étoile"]);
  });

  it("does not match a mere prefix", () => {
    expect(lookupAnswer(index, "sai")).toEqual([]);
    expect(lookupAnswer(index, "Saint")).toEqual([]);
  });

  it("accepts a name without its parenthesised complement", () => {
    expect(lookupAnswer(index, "Saint-Paul")).toEqual(["Saint-Paul (Le Marais)"]);
  });

  it("accepts one part of a dashed name when no other station shares it", () => {
    expect(lookupAnswer(index, "Étoile")).toEqual(["Charles de Gaulle - Étoile"]);
    expect(lookupAnswer(index, "Pablo Picasso")).toEqual(["Bobigny - Pablo Picasso"]);
  });

  it("rejects a part shared by several stations", () => {
    expect(lookupAnswer(index, "Bobigny")).toEqual([]);
  });

  it("prefers an exact full name over another station's part", () => {
    expect(lookupAnswer(index, "Porte Maillot")).toEqual(["Porte Maillot"]);
  });

  it("keeps ignoring a leading 'Gare de'", () => {
    expect(lookupAnswer(index, "Lyon")).toEqual(["Gare de Lyon"]);
  });

  it("matches any declared name of an answer", () => {
    const aliased = buildAnswerIndex([{ key: "Saint-Lazare", names: ["Saint-Lazare", "Haussmann Saint-Lazare"] }]);
    expect(lookupAnswer(aliased, "Haussmann Saint-Lazare")).toEqual(["Saint-Lazare"]);
  });

  it("returns nothing for blank input", () => {
    expect(lookupAnswer(index, "  ")).toEqual([]);
  });
});

describe("findMentionedAnswers", () => {
  it("finds every station named in a sentence", () => {
    expect(findMentionedAnswers(index, "Saint-Lazare euh Saint-Paul et gare de Lyon")).toEqual([
      "Saint-Lazare",
      "Saint-Paul (Le Marais)",
      "Gare de Lyon",
    ]);
  });

  it("prefers the longest name", () => {
    expect(findMentionedAnswers(index, "neuilly porte maillot")).toEqual(["Neuilly - Porte Maillot"]);
  });

  it("matches whole words only", () => {
    expect(findMentionedAnswers(index, "saintlazareville lyonnais")).toEqual([]);
  });

  it("returns nothing for silence", () => {
    expect(findMentionedAnswers(index, "")).toEqual([]);
  });
});

describe("hardcore index", () => {
  const hardcore = buildAnswerIndex(
    ["Charles de Gaulle - Étoile", "Saint-Paul (Le Marais)", "Gare de Lyon"].map((name) => ({ key: name, names: [name] })),
    { hardcore: true },
  );

  it("accepts the exact name, whatever the case, spaces and punctuation", () => {
    expect(lookupAnswer(hardcore, "charles de gaulle étoile")).toEqual(["Charles de Gaulle - Étoile"]);
    expect(lookupAnswer(hardcore, "SAINT PAUL LE MARAIS")).toEqual(["Saint-Paul (Le Marais)"]);
  });

  it("requires accents, every word and the 'Gare de' prefix", () => {
    expect(lookupAnswer(hardcore, "charles de gaulle etoile")).toEqual([]);
    expect(lookupAnswer(hardcore, "Étoile")).toEqual([]);
    expect(lookupAnswer(hardcore, "Saint-Paul")).toEqual([]);
    expect(lookupAnswer(hardcore, "Lyon")).toEqual([]);
    expect(lookupAnswer(hardcore, "gare de lyon")).toEqual(["Gare de Lyon"]);
  });

  it("still finds several exact names in a spoken sentence", () => {
    expect(findMentionedAnswers(hardcore, "gare de Lyon puis Saint-Paul le Marais")).toEqual([
      "Gare de Lyon",
      "Saint-Paul (Le Marais)",
    ]);
  });
});

describe("spoken index", () => {
  const names = ["Charles de Gaulle - Étoile", "Saint-Paul (Le Marais)", "Gare de Lyon"];
  const answers = names.map((name) => ({ key: name, names: [name] }));
  const spokenHardcore = buildAnswerIndex(answers, { hardcore: true, spoken: true });

  it("forgives accents in hardcore, since speech recognition picks the spelling", () => {
    expect(lookupAnswer(spokenHardcore, "charles de gaulle etoile")).toEqual(["Charles de Gaulle - Étoile"]);
    expect(findMentionedAnswers(spokenHardcore, "alors Charles de Gaulle Etoile")).toEqual(["Charles de Gaulle - Étoile"]);
  });

  it("still requires every word and the 'Gare de' prefix in hardcore", () => {
    expect(lookupAnswer(spokenHardcore, "Étoile")).toEqual([]);
    expect(lookupAnswer(spokenHardcore, "Saint-Paul")).toEqual([]);
    expect(lookupAnswer(spokenHardcore, "Lyon")).toEqual([]);
    expect(lookupAnswer(spokenHardcore, "gare de lyon")).toEqual(["Gare de Lyon"]);
  });

  it("changes nothing outside hardcore", () => {
    expect(lookupAnswer(buildAnswerIndex(answers, { spoken: true }), "Étoile")).toEqual(["Charles de Gaulle - Étoile"]);
  });
});
