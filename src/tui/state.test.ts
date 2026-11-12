import { describe, expect, it } from "vitest";
import { buildAnswerIndex } from "@/domain/matching";
import { initialTuiState, tuiReducer, type TuiAction, type TuiState } from "@/tui/state";

const answers = [
  { key: "nation", names: ["Nation"] },
  { key: "bastille", names: ["Bastille"] },
  { key: "vanves", names: ["Porte de Vanves"] },
  { key: "gaite", names: ["Gaîté"] },
];
const indexes = (hardcore = false) => ({
  typed: buildAnswerIndex(answers, { hardcore }),
  spoken: buildAnswerIndex(answers, { hardcore, spoken: true }),
});
const run = (actions: TuiAction[], state: TuiState = initialTuiState("line"), hardcore = false) =>
  actions.reduce((s, action) => tuiReducer(s, action, indexes(hardcore)), state);
const pasted = (text: string): TuiAction => ({ type: "paste", text });
const heard = (transcript: string): TuiAction => ({ type: "hear", transcript });
const typed = (text: string): TuiAction[] => [...text].map((char) => ({ type: "type", text: char }));

describe("tuiReducer", () => {
  it("reveals a station as soon as its name is typed and clears the input", () => {
    const state = run(typed("nation"));
    expect(state).toMatchObject({ input: "", found: ["nation"], lastFound: ["nation"] });
  });

  it("keeps typing when a prefix matches nothing", () => {
    expect(run(typed("nat")).input).toBe("nat");
  });

  it("edits the input", () => {
    expect(run([...typed("nax"), { type: "backspace" }]).input).toBe("na");
    expect(run([...typed("na"), { type: "clear" }]).input).toBe("");
  });

  it("explains a submitted guess that matches nothing", () => {
    const state = run([...typed("foo"), { type: "submit" }]);
    expect(state).toMatchObject({ input: "", feedback: "« foo » : aucune gare" });
  });

  it("explains a station found twice", () => {
    const state = run([...typed("nation"), ...typed("Nation"), { type: "submit" }]);
    expect(state.feedback).toBe("« Nation » : déjà trouvée");
  });

  it("finds every station named in pasted text", () => {
    const state = run([pasted("alors Nation et Bastille")]);
    expect(state).toMatchObject({ input: "", found: ["nation", "bastille"], lastFound: ["nation", "bastille"] });
  });

  it("keeps pasted words until they name a station", () => {
    expect(run([pasted("euh Porte"), pasted(" de")]).input).toBe("euh Porte de");
    expect(run([pasted("euh Porte"), pasted(" de"), pasted(" Vanves")])).toMatchObject({ input: "", found: ["vanves"] });
  });

  it("says when every pasted station is already found", () => {
    const state = run([pasted("Nation"), pasted("encore Nation")]);
    expect(state).toMatchObject({ input: "", found: ["nation"], feedback: "« encore Nation » : déjà trouvée" });
  });

  it("forgives spelling only for what the microphone hears", () => {
    expect(run(typed("gaite"), undefined, true).found).toEqual([]);
    expect(run([pasted("la gaite")], undefined, true).found).toEqual([]);
    expect(run([pasted("porte de vanve")]).found).toEqual([]);
    expect(run([heard("la gaite")], undefined, true).found).toEqual(["gaite"]);
    expect(run([heard("porte de vanve")]).found).toEqual(["vanves"]);
  });

  it("reads the end of a long transcript", () => {
    expect(run([heard(`${"bla ".repeat(500)}Nation`)]).found).toEqual(["nation"]);
  });

  it("finds stations heard among other words, leaving the typed input alone", () => {
    const state = run([...typed("bas"), { type: "hear", transcript: "euh Nation" }]);
    expect(state).toMatchObject({ input: "bas", heard: "euh Nation", found: ["nation"], lastFound: ["nation"] });
  });

  it("counts a station once while the transcript grows", () => {
    const state = run([
      { type: "hear", transcript: "Nation" },
      { type: "hear", transcript: "Nation et Bastille" },
    ]);
    expect(state).toMatchObject({ found: ["nation", "bastille"], lastFound: ["bastille"] });
  });

  it("shows a notice", () => {
    expect(run([{ type: "notice", text: "Micro refusé" }]).feedback).toBe("Micro refusé");
  });

  it("cycles through groupings and resets the scroll", () => {
    const state = run([{ type: "scroll", delta: 5, max: 10 }, { type: "nextGrouping" }]);
    expect(state).toMatchObject({ grouping: "arrondissement", scroll: 0 });
    expect(run([{ type: "nextGrouping" }], initialTuiState("commune")).grouping).toBe("letter");
    expect(run([{ type: "nextGrouping" }], initialTuiState("letter")).grouping).toBe("global");
  });

  it("scrolls within the list", () => {
    expect(run([{ type: "scroll", delta: -3, max: 10 }]).scroll).toBe(0);
    expect(run([{ type: "scroll", delta: 30, max: 10 }]).scroll).toBe(10);
  });
});
