'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createVoiceSession, type RecognitionLike, type VoiceSession } from '@/features/voice/voiceSession';

type RecognitionConstructor = new () => RecognitionLike;

function recognitionConstructor(): RecognitionConstructor | undefined {
  const speech = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speech.SpeechRecognition ?? speech.webkitSpeechRecognition;
}

const noSubscription = () => () => {};

/** Voice input through the browser's speech recognition (Chrome, Edge, Safari). */
export function useVoice(onTranscript: (transcript: string, isFinal: boolean) => void) {
  const supported = useSyncExternalStore(noSubscription, () => recognitionConstructor() !== undefined, () => false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const session = useRef<VoiceSession | null>(null);
  const handler = useRef(onTranscript);

  useEffect(() => {
    handler.current = onTranscript;
  });

  useEffect(() => () => session.current?.stop(), []);

  const start = useCallback(() => {
    const Recognition = recognitionConstructor();
    if (!Recognition) return;
    session.current ??= createVoiceSession(() => new Recognition(), {
      onTranscript: (text, isFinal) => {
        setTranscript(text);
        handler.current(text, isFinal);
      },
      onListeningChange: (isListening) => {
        setListening(isListening);
        if (isListening) setError(null);
      },
      onError: setError,
    });
    session.current.start();
  }, []);

  const stop = useCallback(() => {
    session.current?.stop();
    setTranscript('');
  }, []);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  return { supported, listening, transcript, error, start, stop, toggle };
}
