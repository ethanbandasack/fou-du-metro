import { lookupAnswer, type AnswerIndex } from "@/domain/matching";
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
}

export type TuiAction =
  | { type: "type"; text: string }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "submit" }
  | { type: "nextGrouping" }
  | { type: "scroll"; delta: number; max: number };

export function initialTuiState(grouping: Grouping): TuiState {
  return { input: "", found: [], lastFound: [], grouping, scroll: 0, feedback: "" };
}

/** Records the keys of `input` that are new; stations are revealed as soon as their name is complete. */
function guess(state: TuiState, input: string, index: AnswerIndex): TuiState {
  const fresh = lookupAnswer(index, input).filter((key) => !state.found.includes(key));
  if (fresh.length === 0) return { ...state, input };
  return { ...state, input: "", found: [...state.found, ...fresh], lastFound: fresh, feedback: "" };
}

export function tuiReducer(state: TuiState, action: TuiAction, index: AnswerIndex): TuiState {
  switch (action.type) {
    case "type":
      return guess(state, state.input + action.text, index);
    case "backspace":
      return { ...state, input: state.input.slice(0, -1) };
    case "clear":
      return { ...state, input: "" };
    case "submit": {
      const input = state.input.trim();
      if (!input) return state;
      const known = lookupAnswer(index, input).length > 0;
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
