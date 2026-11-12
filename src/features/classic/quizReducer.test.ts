import { describe, expect, it } from "vitest";
import { initialQuizState, quizReducer, type QuizAction, type QuizState } from "@/features/classic/quizReducer";

const run = (actions: QuizAction[], state: QuizState = initialQuizState(3)) => actions.reduce(quizReducer, state);

describe("quizReducer", () => {
  it("starts idle with nothing found", () => {
    expect(initialQuizState(3)).toEqual({ status: "idle", total: 3, found: [], lastFound: [], elapsedSeconds: 0 });
  });

  it("starts a fresh game", () => {
    const state = run([{ type: "start" }, { type: "guess", keys: ["a"] }, { type: "tick" }, { type: "start" }]);
    expect(state).toMatchObject({ status: "running", found: [], elapsedSeconds: 0 });
  });

  it("counts time only while running", () => {
    const state = run([{ type: "tick" }, { type: "start" }, { type: "tick" }, { type: "togglePause" }, { type: "tick" }]);
    expect(state).toMatchObject({ status: "paused", elapsedSeconds: 1 });
  });

  it("records new keys once and remembers the latest ones", () => {
    const state = run([{ type: "start" }, { type: "guess", keys: ["a"] }, { type: "guess", keys: ["a", "b"] }]);
    expect(state.found).toEqual(["a", "b"]);
    expect(state.lastFound).toEqual(["b"]);
  });

  it("ignores guesses unless running", () => {
    expect(run([{ type: "guess", keys: ["a"] }]).found).toEqual([]);
    expect(run([{ type: "start" }, { type: "togglePause" }, { type: "guess", keys: ["a"] }]).found).toEqual([]);
  });

  it("finishes when every key is found", () => {
    const state = run([{ type: "start" }, { type: "guess", keys: ["a", "b"] }, { type: "guess", keys: ["c"] }]);
    expect(state.status).toBe("finished");
  });

  it("finishes on stop and keeps progress and time", () => {
    const state = run([{ type: "start" }, { type: "tick" }, { type: "guess", keys: ["a"] }, { type: "stop" }]);
    expect(state).toMatchObject({ status: "finished", found: ["a"], elapsedSeconds: 1 });
  });

  it("resets to idle with a new total", () => {
    const state = run([{ type: "start" }, { type: "guess", keys: ["a"] }, { type: "reset", total: 5 }]);
    expect(state).toEqual(initialQuizState(5));
  });
});
