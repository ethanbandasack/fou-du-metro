import { findMentionedAnswers, lookupAnswer, type AnswerIndex } from "@/domain/matching";
import { GROUPINGS, type Grouping } from "@/tui/progress";

export interface TuiState {
  input: string;
  /** Found answer keys, in discovery order. */
  found: string[];
  /** Keys found by the latest guess. */
  lastFound: string[];
  grouping: Grouping;
  /** First visible group row. */
  scroll: number;
  /** Message about the last submitted guess. */
  feedback: string;
  /** What the microphone heard last. */
  heard: string;
}

/** Keyboard text is matched as written; what the microphone hears, by sound (see buildAnswerIndex). */
export interface TuiIndexes {
  typed: AnswerIndex;
  spoken: AnswerIndex;
}

export type TuiAction =
  | { type: "type"; text: string }
  /** Text read in one go: a paste or the system dictation. */
  | { type: "paste"; text: string }
  /** The microphone's transcript so far, which grows until the recognizer starts a new one. */
  | { type: "hear"; transcript: string }
  | { type: "notice"; text: string }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "nextGrouping" }
  | { type: "scroll"; delta: number; max: number };

export function initialTuiState(grouping: Grouping): TuiState {
  return { input: "", found: [], lastFound: [], grouping, scroll: 0, feedback: "", heard: "" };
}

const record = (state: TuiState, fresh: string[]): TuiState => ({
  ...state,
  input: "",
  found: [...state.found, ...fresh],
  lastFound: fresh,
  feedback: "",
});

/** Records the keys of `input` that are new; stations are revealed as soon as their name is complete. */
function guess(state: TuiState, input: string, index: AnswerIndex): TuiState {
  const fresh = lookupAnswer(index, input).filter((key) => !state.found.includes(key));
  return fresh.length === 0 ? { ...state, input } : record(state, fresh);
}

/** Pasted words wait in the input until they name a station, which may span several pastes. */
function paste(state: TuiState, input: string, index: AnswerIndex): TuiState {
  const named = findMentionedAnswers(index, input);
  if (named.length === 0) return { ...state, input };
  const fresh = named.filter((key) => !state.found.includes(key));
  if (fresh.length === 0) return { ...state, input: "", feedback: `« ${input.trim()} » : déjà trouvée` };
  return record(state, fresh);
}

export function tuiReducer(state: TuiState, action: TuiAction, indexes: TuiIndexes): TuiState {
  switch (action.type) {
    case "type":
      return guess(state, state.input + action.text, indexes.typed);
    case "paste":
      return paste(state, state.input + action.text, indexes.typed);
    case "hear": {
      const fresh = findMentionedAnswers(indexes.spoken, action.transcript).filter((key) => !state.found.includes(key));
      const heard = { ...state, heard: action.transcript };
      return fresh.length === 0 ? heard : { ...heard, found: [...state.found, ...fresh], lastFound: fresh, feedback: "" };
    }
    case "notice":
      return { ...state, feedback: action.text };
    case "backspace":
      return { ...state, input: state.input.slice(0, -1) };
    case "clear":
      return { ...state, input: "" };
    case "submit": {
      const input = state.input.trim();
      if (!input) return state;
      const known = lookupAnswer(indexes.typed, input).length > 0;
      return { ...state, input: "", feedback: `« ${input} » : ${known ? "déjà trouvée" : "aucune gare"}` };
    }
    case "nextGrouping": {
      const next = GROUPINGS[(GROUPINGS.indexOf(state.grouping) + 1) % GROUPINGS.length];
      return { ...state, grouping: next, scroll: 0 };
    }
    case "scroll":
      return { ...state, scroll: Math.min(Math.max(0, state.scroll + action.delta), Math.max(0, action.max)) };
  }
}
