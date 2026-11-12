'use client';

import { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export const VOICE_SHORTCUT = 'Alt+V';

interface VoiceButtonProps {
  supported: boolean;
  listening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

/** Microphone toggle, also bound to Alt+V (Option+V on a Mac). */
export function VoiceButton({ supported, listening, onToggle, disabled = false, className = '' }: VoiceButtonProps) {
  const enabled = supported && !disabled;
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === 'KeyV') {
        event.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onToggle]);

  const title = !supported
    ? 'Dictée indisponible dans ce navigateur (essayez Chrome, Edge ou Safari)'
    : listening
      ? `Arrêter la dictée (${VOICE_SHORTCUT})`
      : `Dicter des gares (${VOICE_SHORTCUT})`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!enabled}
      title={title}
      aria-label={title}
      aria-pressed={listening}
      className={`flex items-center justify-center border border-border px-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        listening ? 'bg-red-600 text-white animate-pulse' : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
      } ${className}`}
    >
      {listening ? <Mic size={20} /> : <MicOff size={20} />}
    </button>
  );
}

/** What the microphone heard, or why it stopped. */
export function VoiceStatus({ listening, transcript, error }: { listening: boolean; transcript: string; error: string | null }) {
  if (error) return <p className="text-xs font-bold text-red-600" role="alert">{error}</p>;
  if (!listening) return null;
  return (
    <p className="text-xs font-medium text-foreground/60" aria-live="polite">
      À l&apos;écoute : dites un ou plusieurs noms de gares{transcript && <> · « {transcript} »</>}
    </p>
  );
}
