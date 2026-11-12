'use client';

import { forwardRef, type RefObject } from 'react';
import { Flag, Pause, Play } from 'lucide-react';
import { ToolbarButton } from '@/components/ToolbarButton';
import { formatDuration } from '@/domain/format';
import type { QuizState } from '@/features/classic/quizReducer';
import { VoiceButton, VoiceStatus } from '@/features/voice/VoiceControls';

interface Voice {
  supported: boolean;
  listening: boolean;
  transcript: string;
  error: string | null;
  toggle: () => void;
}

interface PlayBarProps {
  quiz: QuizState;
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  lastFoundNames: string[];
  voice: Voice;
  onInput: (value: string) => void;
  onStart: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}

/** Sticky strip of the classic quiz: clock, input or start button, progress. */
export const PlayBar = forwardRef<HTMLDivElement, PlayBarProps>(function PlayBar(
  { quiz, input, inputRef, lastFoundNames, voice, onInput, onStart, onTogglePause, onStop },
  ref
) {
  const isPlaying = quiz.status === 'running' || quiz.status === 'paused';
  const paused = quiz.status === 'paused';
  const progress = quiz.total > 0 ? (quiz.found.length / quiz.total) * 100 : 0;

  return (
    <div ref={ref} className="sticky top-[var(--nav-height)] z-50 bg-card border-b border-border shadow-sm">
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-3 sm:px-4 pt-3">
        <span className="mr-auto sm:mr-0 w-[4.5rem] shrink-0 text-lg sm:text-2xl font-mono font-bold tabular-nums" aria-label="Temps écoulé">
          {formatDuration(quiz.elapsedSeconds)}
        </span>
        {isPlaying ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && onInput('')}
              placeholder={paused ? 'En pause' : "Tapez le nom d'une gare..."}
              disabled={paused}
              autoComplete="off"
              spellCheck={false}
              aria-label="Nom d'une gare"
              className="order-last sm:order-none basis-full sm:basis-auto flex-1 min-w-0 h-12 px-3 border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:bg-accent focus:text-accent-foreground focus:placeholder:text-accent-foreground/50 text-lg sm:text-xl font-black tracking-tight font-parisine transition-colors disabled:bg-muted"
            />
            <VoiceButton
              supported={voice.supported}
              disabled={quiz.status !== 'running'}
              listening={voice.listening}
              onToggle={voice.toggle}
              className="h-12"
            />
            <ToolbarButton icon={paused ? Play : Pause} label={paused ? 'Reprendre' : 'Pause'} onClick={onTogglePause} className="h-12" />
            <ToolbarButton icon={Flag} label="Terminer" onClick={onStop} className="h-12" />
          </>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={quiz.total === 0}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-accent text-accent-foreground border border-border font-black uppercase tracking-wide text-xs hover:opacity-85 transition-opacity disabled:opacity-40"
          >
            <Play size={16} aria-hidden />
            {quiz.status === 'finished' ? 'Rejouer' : 'Lancer le quiz'}
          </button>
        )}
      </div>

      <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
        <div className="flex justify-between items-center gap-3 text-[11px] font-bold">
          <span className="min-w-0 truncate text-green-700 dark:text-green-400" aria-live="polite">
            {lastFoundNames.length > 0 && `✓ ${lastFoundNames.join(', ')}`}
          </span>
          <span className="shrink-0 text-foreground/60 tabular-nums">
            {quiz.found.length} / {quiz.total} gares ({Math.round(progress)}%)
          </span>
        </div>
        <div className="w-full bg-muted h-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={quiz.total} aria-valuenow={quiz.found.length}>
          <div className="bg-accent h-1.5 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <VoiceStatus listening={voice.listening} transcript={voice.transcript} error={voice.error} />
      </div>
    </div>
  );
});
