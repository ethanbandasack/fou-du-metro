'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createVoiceSession, type RecognitionLike, type VoiceSession } from '@/features/voice/voiceSession';

type RecognitionConstructor = new () => RecognitionLike;

/** Voice input through the browser's speech recognition (Chrome, Edge, Safari). */
export function useVoice(onTranscript: (transcript: string, isFinal: boolean) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const session = useRef<VoiceSession | null>(null);
  const handler = useRef(onTranscript);

  useEffect(() => {
    handler.current = onTranscript;
  });

  useEffect(() => {
    const speech = window as unknown as {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Recognition = speech.SpeechRecognition ?? speech.webkitSpeechRecognition;
    if (!Recognition) return;
    setSupported(true);
    const created = createVoiceSession(() => new Recognition(), {
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
    session.current = created;
    return () => created.stop();
  }, []);

  const start = useCallback(() => session.current?.start(), []);
  const stop = useCallback(() => {
    session.current?.stop();
    setTranscript('');
  }, []);
  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  return { supported, listening, transcript, error, start, stop, toggle };
}
