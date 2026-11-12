import { describe, expect, it, vi } from "vitest";
import { createVoiceSession, type RecognitionLike } from "@/features/voice/voiceSession";

class FakeRecognition implements RecognitionLike {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: RecognitionLike["onresult"] = null;
  onend: RecognitionLike["onend"] = null;
  onerror: RecognitionLike["onerror"] = null;
  starts = 0;
  start = () => { this.starts++; };
  stop = () => { this.onend?.(); };
  say(transcript: string, isFinal: boolean) {
    const result = Object.assign([{ transcript }], { isFinal });
    this.onresult?.({ resultIndex: 0, results: [result] });
  }
}

function setup() {
  const recognition = new FakeRecognition();
  const onTranscript = vi.fn();
  const onListeningChange = vi.fn();
  const onError = vi.fn();
  const session = createVoiceSession(() => recognition, { onTranscript, onListeningChange, onError });
  return { recognition, session, onTranscript, onListeningChange, onError };
}

describe("createVoiceSession", () => {
  it("listens continuously in French with interim results", () => {
    const { recognition, session, onListeningChange } = setup();
    session.start();
    expect(recognition).toMatchObject({ lang: "fr-FR", continuous: true, interimResults: true, starts: 1 });
    expect(onListeningChange).toHaveBeenLastCalledWith(true);
  });

  it("ignores a second start while listening (the browser would throw)", () => {
    const { recognition, session } = setup();
    session.start();
    session.start();
    expect(recognition.starts).toBe(1);
  });

  it("survives a browser refusing to start while still stopping", () => {
    const { recognition, session, onListeningChange } = setup();
    recognition.start = () => { throw new Error("InvalidStateError"); };
    expect(() => session.start()).not.toThrow();
    expect(onListeningChange).toHaveBeenLastCalledWith(true);
  });

  it("forwards interim and final transcripts", () => {
    const { recognition, session, onTranscript } = setup();
    session.start();
    recognition.say("nation", false);
    recognition.say("nation bastille", true);
    expect(onTranscript.mock.calls).toEqual([["nation", false], ["nation bastille", true]]);
  });

  it("restarts when the browser ends recognition on its own", () => {
    const { recognition, session } = setup();
    session.start();
    recognition.onend?.();
    expect(recognition.starts).toBe(2);
  });

  it("stays stopped after the player stops it", () => {
    const { recognition, session, onListeningChange } = setup();
    session.start();
    session.stop();
    expect(recognition.starts).toBe(1);
    expect(onListeningChange).toHaveBeenLastCalledWith(false);
  });

  it("gives up and reports a refused microphone", () => {
    const { recognition, session, onError, onListeningChange } = setup();
    session.start();
    recognition.onerror?.({ error: "not-allowed" });
    recognition.onend?.();
    expect(recognition.starts).toBe(1);
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/micro/i));
    expect(onListeningChange).toHaveBeenLastCalledWith(false);
  });

  it("ignores silence timeouts", () => {
    const { recognition, session, onError } = setup();
    session.start();
    recognition.onerror?.({ error: "no-speech" });
    expect(onError).not.toHaveBeenCalled();
  });
});
