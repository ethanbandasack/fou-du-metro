export type QuizStatus = "idle" | "running" | "paused" | "finished";

export interface QuizState {
  status: QuizStatus;
  /** Number of distinct answers in play. */
  total: number;
  /** Found answer keys, in discovery order. */
  found: string[];
  /** Keys found by the latest successful guess. */
  lastFound: string[];
  elapsedSeconds: number;
}

export type QuizAction =
  | { type: "start" }
  | { type: "togglePause" }
  | { type: "tick" }
  | { type: "guess"; keys: string[] }
  | { type: "stop" }
  | { type: "reset"; total: number };

export function initialQuizState(total: number): QuizState {
  return { status: "idle", total, found: [], lastFound: [], elapsedSeconds: 0 };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
      return { ...initialQuizState(state.total), status: "running" };
    case "togglePause":
      if (state.status === "running") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "running" };
      return state;
    case "tick":
      return state.status === "running" ? { ...state, elapsedSeconds: state.elapsedSeconds + 1 } : state;
    case "guess": {
      if (state.status !== "running") return state;
      const fresh = [...new Set(action.keys)].filter((key) => !state.found.includes(key));
      if (fresh.length === 0) return state;
      const found = [...state.found, ...fresh];
      return { ...state, found, lastFound: fresh, status: found.length >= state.total ? "finished" : state.status };
    }
    case "stop":
      return state.status === "running" || state.status === "paused" ? { ...state, status: "finished" } : state;
    case "reset":
      return initialQuizState(action.total);
  }
}
