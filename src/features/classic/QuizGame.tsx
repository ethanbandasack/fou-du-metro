'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Settings, Play, Pause, RotateCcw, Trophy, Eye, EyeOff, Search, LogIn, LogOut, Map as MapIcon, User as UserIcon } from 'lucide-react';
import { formatDuration } from '@/domain/format';
import { buildAnswerIndex, findMentionedAnswers, lookupAnswer } from '@/domain/matching';
import type { Line } from '@/domain/network';
import { LoginModal } from '@/features/auth/LoginModal';
import { useAuth } from '@/features/auth/useAuth';
import { LineFilter } from '@/features/classic/LineFilter';
import QuizTable from '@/features/classic/QuizTable';
import { initialQuizState, quizReducer } from '@/features/classic/quizReducer';
import { ScoresPanel } from '@/features/classic/ScoresPanel';
import { addScore, createScore, parseStoredScores, SCORES_STORAGE_KEY, type QuizScore } from '@/features/classic/scores';
import { answersOf, selectLines } from '@/domain/selection';
import { DEFAULT_SETTINGS, parseStoredSettings, SETTINGS_STORAGE_KEY, type QuizSettings } from '@/features/classic/settings';
import { StationMap } from '@/features/map/StationMap';
import { useVoice } from '@/features/voice/useVoice';
import { VoiceButton, VoiceStatus } from '@/features/voice/VoiceControls';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

const toolbarButton = (active: boolean) =>
  `flex items-center gap-2 px-4 py-2 border border-border text-[11px] font-bold transition-all ${
    active ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
  }`;

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

  const playLines = useMemo(
    () => selectLines(lines, settings),
    // Only the line selection matters, not display options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines, settings.selectedModes, settings.selectedLines]
  );
  const answers = useMemo(() => answersOf(playLines), [playLines]);
  const answerIndex = useMemo(() => buildAnswerIndex(answers), [answers]);
  const namesByKey = useMemo(() => new Map(answers.map(a => [a.key, a.names[0]])), [answers]);

  const [quiz, dispatch] = useReducer(quizReducer, answers.length, initialQuizState);
  const isPlaying = quiz.status === 'running' || quiz.status === 'paused';
  const isComplete = quiz.total > 0 && quiz.found.length === quiz.total;
  const progress = quiz.total > 0 ? (quiz.found.length / quiz.total) * 100 : 0;
  const foundSet = useMemo(() => new Set(quiz.found), [quiz.found]);

  // A new selection starts a new game.
  useEffect(() => {
    dispatch({ type: 'reset', total: answers.length });
    setInput('');
  }, [answers]);

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
      date: new Date(),
    });
    setScores(prev => addScore(prev, score));
  }, [quiz, player, settings.selectedModes, settings.selectedLines, setScores]);

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
    const keys = findMentionedAnswers(answerIndex, transcript);
    if (keys.length > 0) dispatch({ type: 'guess', keys });
  });
  const stopVoice = voice.stop;
  useEffect(() => {
    if (quiz.status !== 'running') stopVoice();
  }, [quiz.status, stopVoice]);

  const updateSettings = (patch: Partial<QuizSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <div className="max-w-6xl mx-auto">
      <div ref={headerRef} className="sticky top-20 bg-card z-50 shadow-sm mb-6 transition-colors duration-300">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 p-4 bg-muted">
              <div className="text-2xl font-mono font-bold text-foreground min-w-[80px]">
                {formatDuration(quiz.elapsedSeconds)}
              </div>
              {quiz.status === 'paused' && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">En pause</div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {authLoading ? null : player ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/60 flex items-center gap-1">
                    <UserIcon size={16} />
                    {player.username}
                  </span>
                  <button onClick={logout} className={toolbarButton(false)}>
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className={toolbarButton(false)}>
                  <LogIn size={16} />
                  Connexion
                </button>
              )}

              <button onClick={() => setShowSettings(!showSettings)} className={toolbarButton(showSettings)}>
                <Settings size={16} />
                Paramètres
              </button>

              <button onClick={() => setShowScores(!showScores)} className={toolbarButton(showScores)}>
                <Trophy size={16} />
                Scores
              </button>

              <button
                onClick={() => updateSettings({ showConnections: !settings.showConnections })}
                className={toolbarButton(settings.showConnections)}
              >
                {settings.showConnections ? <Eye size={16} /> : <EyeOff size={16} />}
                {settings.showConnections ? 'Masquer' : 'Afficher'} corresp.
              </button>

              <button onClick={() => updateSettings({ showMap: !settings.showMap })} className={toolbarButton(settings.showMap)}>
                <MapIcon size={16} />
                {settings.showMap ? 'Masquer la carte' : 'Carte'}
              </button>

              {isPlaying ? (
                <>
                  <button onClick={() => dispatch({ type: 'togglePause' })} className={toolbarButton(false)}>
                    <Pause size={16} />
                    {quiz.status === 'paused' ? 'Reprendre' : 'Pause'}
                  </button>
                  <button onClick={() => dispatch({ type: 'stop' })} className={toolbarButton(true)}>
                    <RotateCcw size={16} />
                    Terminer
                  </button>
                </>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'start' })}
                  disabled={quiz.total === 0}
                  className={`${toolbarButton(true)} uppercase tracking-wide disabled:opacity-40`}
                >
                  <Play size={16} />
                  Lancer le quiz
                </button>
              )}

              <button onClick={() => setShowAllAnswers(!showAllAnswers)} className={toolbarButton(showAllAnswers)}>
                {showAllAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
                {showAllAnswers ? 'Masquer les solutions' : 'Afficher les solutions'}
              </button>
            </div>
          </div>

          {isPlaying && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setInput('')}
                    placeholder="Tapez le nom d'une gare..."
                    disabled={quiz.status === 'paused'}
                    autoComplete="off"
                    spellCheck={false}
                    className="block w-full px-10 py-4 border border-border bg-card text-foreground placeholder-gray-400 focus:outline-none focus:bg-accent focus:text-accent-foreground text-xl font-black tracking-tight font-parisine transition-colors"
                  />
                  {quiz.lastFound.length > 0 && (
                    <div key={quiz.found.length} className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-600 text-white px-2 py-1 text-sm font-bold">
                      ✓ {quiz.lastFound.map(key => namesByKey.get(key)).join(', ')}
                    </div>
                  )}
                </div>
                <VoiceButton
                  supported={voice.supported}
                  disabled={quiz.status !== 'running'}
                  listening={voice.listening}
                  onToggle={voice.toggle}
                />
              </div>
              <VoiceStatus listening={voice.listening} transcript={voice.transcript} error={voice.error} />
            </div>
          )}

          {quiz.total > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-foreground/40 tracking-wider">Progression globale</span>
                <span className="text-[10px] font-black text-foreground/60">
                  {quiz.found.length} / {quiz.total} gares ({Math.round(progress)}%)
                </span>
              </div>
              <div className="w-full bg-muted h-2">
                <div className="bg-accent h-2 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogin && <LoginModal onLogin={login} onClose={() => setShowLogin(false)} />}

      <div className="px-6 space-y-6">
        {showSettings && (
          <LineFilter
            lines={lines}
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
