/** The subset of the Web Speech API `SpeechRecognition` used here. */
export interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

export interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

interface VoiceHandlers {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onListeningChange: (listening: boolean) => void;
  onError: (message: string) => void;
}

export interface VoiceSession {
  start(): void;
  stop(): void;
}

const FATAL_ERRORS: Record<string, string> = {
  "not-allowed": "Accès au micro refusé.",
  "service-not-allowed": "Accès au micro refusé.",
  "audio-capture": "Aucun micro détecté.",
  network: "Reconnaissance vocale indisponible (réseau).",
};

/**
 * Continuous French recognition that survives the browser's automatic stops
 * (Chrome ends a session after a silence) until the player stops it.
 */
export function createVoiceSession(create: () => RecognitionLike, handlers: VoiceHandlers): VoiceSession {
  let recognition: RecognitionLike | null = null;
  let wanted = false;

  const setListening = (listening: boolean) => {
    wanted = listening;
    handlers.onListeningChange(listening);
  };

  // start() throws if the previous session has not fully ended yet; onend restarts it then.
  const safeStart = (r: RecognitionLike) => {
    try {
      r.start();
    } catch {
      // Already starting or still stopping.
    }
  };

  const setup = (): RecognitionLike => {
    const r = create();
    r.lang = "fr-FR";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        handlers.onTranscript(result[0].transcript, result.isFinal);
      }
    };
    r.onerror = (event) => {
      const fatal = FATAL_ERRORS[event.error];
      if (!fatal) return; // no-speech, aborted...: onend restarts if still wanted
      setListening(false);
      handlers.onError(fatal);
    };
    r.onend = () => {
      if (wanted) safeStart(r);
    };
    return r;
  };

  return {
    start() {
      if (wanted) return;
      recognition ??= setup();
      setListening(true);
      safeStart(recognition);
    },
    stop() {
      setListening(false);
      recognition?.stop();
    },
  };
}
