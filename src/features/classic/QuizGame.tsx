'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BookOpen, CalendarClock, Eye, EyeOff, Flame, LogIn, LogOut, Map as MapIcon, Settings, Trophy, User as UserIcon } from 'lucide-react';
import { ToolbarButton } from '@/components/ToolbarButton';
import { formatDuration } from '@/domain/format';
import { buildAnswerIndex, findMentionedAnswers, lookupAnswer } from '@/domain/matching';
import type { Line } from '@/domain/network';
import { LoginModal } from '@/features/auth/LoginModal';
import { useAuth } from '@/features/auth/useAuth';
import { LineFilter } from '@/features/classic/LineFilter';
import QuizTable from '@/features/classic/QuizTable';
import { initialQuizState, quizReducer } from '@/features/classic/quizReducer';
import { PlayBar } from '@/features/classic/PlayBar';
import { ScoresPanel } from '@/features/classic/ScoresPanel';
import { addScore, createScore, parseStoredScores, SCORES_STORAGE_KEY, type QuizScore } from '@/features/classic/scores';
import { answersOf, openLineIds, selectLines } from '@/domain/selection';
import { DEFAULT_SETTINGS, parseStoredSettings, SETTINGS_STORAGE_KEY, type QuizSettings } from '@/features/classic/settings';
import { StationMap } from '@/features/map/StationMap';
import { useVoice } from '@/features/voice/useVoice';
import { useHardcore } from '@/hooks/useHardcore';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useToday } from '@/hooks/useToday';

export function QuizGame({ lines }: { lines: Line[] }) {
  const { player, loading: authLoading, login, logout } = useAuth();
  const [scores, setScores] = useLocalStorageState<QuizScore[]>(SCORES_STORAGE_KEY, [], parseStoredScores);
  const [settings, setSettings] = useLocalStorageState<QuizSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS, parseStoredSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const today = useToday();
  const playLines = useMemo(
    () => selectLines(lines, { ...settings, today }),
    // Only the line selection matters, not display options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, settings.selectedModes, settings.selectedLines, settings.includeFuture, today]
  );
  const openLines = useMemo(() => openLineIds(lines, today), [lines, today]);
  const answers = useMemo(() => answersOf(playLines), [playLines]);
  const [hardcore, setHardcore] = useHardcore();
  const answerIndex = useMemo(() => buildAnswerIndex(answers, { hardcore }), [answers, hardcore]);
  const spokenIndex = useMemo(() => buildAnswerIndex(answers, { hardcore, spoken: true }), [answers, hardcore]);
  const namesByKey = useMemo(() => new Map(answers.map(a => [a.key, a.names[0]])), [answers]);

  const [quiz, dispatch] = useReducer(quizReducer, answers.length, initialQuizState);
  const isComplete = quiz.total > 0 && quiz.found.length === quiz.total;
  const foundSet = useMemo(() => new Set(quiz.found), [quiz.found]);

  // A new selection or a change of difficulty starts a new game.
  const [quizRules, setQuizRules] = useState({ answers, hardcore });
  if (quizRules.answers !== answers || quizRules.hardcore !== hardcore) {
    setQuizRules({ answers, hardcore });
    dispatch({ type: 'reset', total: answers.length });
    setInput('');
  }

  // Clock
  useEffect(() => {
    if (quiz.status !== 'running') return;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [quiz.status]);

  // Focus the input whenever play (re)starts
  useEffect(() => {
    if (quiz.status === 'running') inputRef.current?.focus();
  }, [quiz.status]);

  // Save the score of a logged-in player when a game ends
  const previousStatus = useRef(quiz.status);
  useEffect(() => {
    const wasPlaying = previousStatus.current === 'running' || previousStatus.current === 'paused';
    previousStatus.current = quiz.status;
    if (!wasPlaying || quiz.status !== 'finished' || !player || quiz.found.length === 0) return;
    const score = createScore({
      id: Date.now().toString(),
      found: quiz.found.length,
      total: quiz.total,
      elapsedSeconds: quiz.elapsedSeconds,
      modes: settings.selectedModes,
      lines: settings.selectedLines,
      username: player.username,
      hardcore,
      date: new Date(),
    });
    setScores(prev => addScore(prev, score));
  }, [quiz, player, hardcore, settings.selectedModes, settings.selectedLines, setScores]);

  // Line headers stick below this header: expose its height to CSS
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty('--quiz-header-height', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleInput = (value: string) => {
    setInput(value);
    const keys = lookupAnswer(answerIndex, value);
    if (keys.some(key => !quiz.found.includes(key))) {
      dispatch({ type: 'guess', keys });
      setInput('');
    }
  };

  // Voice: every station named in what the player says counts as typed.
  const voice = useVoice((transcript) => {
    if (quiz.status !== 'running') return;
    const keys = findMentionedAnswers(spokenIndex, transcript);
    if (keys.length > 0) dispatch({ type: 'guess', keys });
  });
  const stopVoice = voice.stop;
  useEffect(() => {
    if (quiz.status !== 'running') stopVoice();
  }, [quiz.status, stopVoice]);

  const updateSettings = (patch: Partial<QuizSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {authLoading ? null : player ? (
          <>
            <span className="h-10 flex items-center gap-1 px-2 text-sm text-foreground/60">
              <UserIcon size={16} aria-hidden />
              {player.username}
            </span>
            <ToolbarButton icon={LogOut} label="Déconnexion" onClick={logout} />
          </>
        ) : (
          <ToolbarButton icon={LogIn} label="Connexion" onClick={() => setShowLogin(true)} />
        )}
        <ToolbarButton icon={Settings} label="Paramètres" active={showSettings} onClick={() => setShowSettings(!showSettings)} />
        <ToolbarButton icon={Trophy} label="Scores" active={showScores} onClick={() => setShowScores(!showScores)} />
        <ToolbarButton
          icon={settings.showConnections ? Eye : EyeOff}
          label="Correspondances"
          active={settings.showConnections}
          onClick={() => updateSettings({ showConnections: !settings.showConnections })}
        />
        <ToolbarButton icon={MapIcon} label="Carte" active={settings.showMap} onClick={() => updateSettings({ showMap: !settings.showMap })} />
        <ToolbarButton icon={BookOpen} label="Solutions" active={showAllAnswers} onClick={() => setShowAllAnswers(!showAllAnswers)} />
        <ToolbarButton icon={Flame} label="Hardcore" active={hardcore} onClick={() => setHardcore(!hardcore)} />
        <ToolbarButton
          icon={CalendarClock}
          label="Lignes futures"
          active={settings.includeFuture}
          onClick={() => updateSettings({ includeFuture: !settings.includeFuture })}
        />
      </div>

      <PlayBar
        ref={headerRef}
        quiz={quiz}
        input={input}
        inputRef={inputRef}
        lastFoundNames={quiz.lastFound.map(key => namesByKey.get(key) ?? key)}
        voice={voice}
        onInput={handleInput}
        onStart={() => dispatch({ type: 'start' })}
        onTogglePause={() => dispatch({ type: 'togglePause' })}
        onStop={() => dispatch({ type: 'stop' })}
      />

      {showLogin && <LoginModal onLogin={login} onClose={() => setShowLogin(false)} />}

      <div className="pt-6 space-y-6">
        {showSettings && (
          <LineFilter
            lines={settings.includeFuture ? lines : lines.filter(line => openLines.has(line.id))}
            selectedLines={settings.selectedLines}
            selectedModes={settings.selectedModes}
            onSelectionChange={(selectedLines) => updateSettings({ selectedLines })}
            onModeChange={(selectedModes) => updateSettings({ selectedModes })}
          />
        )}

        {showScores && (
          <ScoresPanel
            scores={scores}
            canEdit={player !== null}
            onDelete={(id) => setScores(prev => prev.filter(score => score.id !== id))}
            onClear={() => setScores([])}
            onClose={() => setShowScores(false)}
          />
        )}

        {quiz.status === 'finished' && isComplete && (
          <div className="space-y-4">
            <div className="bg-green-500/10 border-2 border-green-500 p-6 text-center">
              <Trophy size={48} className="mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2 font-parisine">Félicitations !</h2>
              <p className="text-green-700 dark:text-green-400 font-bold uppercase text-[10px] tracking-widest">
                Vous avez identifié les {quiz.total} gares en {formatDuration(quiz.elapsedSeconds)} !
              </p>
            </div>
            {!player && (
              <div className="bg-yellow-500/10 border-2 border-yellow-500 p-4 text-center">
                <p className="font-bold uppercase text-xs text-yellow-700 dark:text-yellow-400 mb-2">Score non sauvegardé</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-[10px] mb-3 font-bold uppercase">
                  Connectez-vous pour suivre votre progression !
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-yellow-500 text-white border-2 border-yellow-600 px-4 py-2 font-black uppercase text-[10px] hover:bg-yellow-600 transition-colors"
                >
                  Se connecter pour sauvegarder
                </button>
              </div>
            )}
          </div>
        )}

        {settings.showMap && playLines.length > 0 && (
          <StationMap
            lines={playLines}
            found={foundSet}
            highlighted={quiz.lastFound}
            revealAll={showAllAnswers || quiz.status === 'finished'}
            showUnfound={settings.showUnfoundOnMap}
            onShowUnfoundChange={(showUnfoundOnMap) => updateSettings({ showUnfoundOnMap })}
          />
        )}

        {playLines.length > 0 ? (
          <QuizTable
            lines={playLines}
            guessedStations={quiz.found}
            showAllAnswers={showAllAnswers}
            gameEnded={quiz.status === 'finished'}
            showConnections={settings.showConnections}
            isAuthenticated={player !== null}
            showLine={(id) => settings.includeFuture || openLines.has(id)}
          />
        ) : (
          <div className="text-center py-12">
            <Settings size={64} className="mx-auto text-foreground/30 mb-4" />
            <h3 className="text-xl font-black uppercase text-foreground mb-2">Aucune gare disponible</h3>
            <p className="text-foreground/50 mb-4 font-bold uppercase text-[10px] tracking-widest">
              Sélectionnez des modes de transport et/ou des lignes dans les paramètres pour commencer le quiz.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 bg-accent text-accent-foreground border-2 border-border font-black uppercase tracking-widest text-xs hover:opacity-80 transition-colors"
            >
              Ouvrir les paramètres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
