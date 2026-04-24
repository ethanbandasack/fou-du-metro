'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MetroStation, MetroLine, QuizState, QuizSettings, QuizScore, AuthState, User } from '@/types/metro';
import { Timer } from './Timer';
import QuizTable from './QuizTable';
import { LineFilter } from './LineFilter';
import { Settings, Play, Pause, RotateCcw, Trophy, Eye, EyeOff, Search, Trash2, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { shuffleArray, normalizeStationName, fuzzyMatch } from '@/utils/metroUtils';

interface QuizGameProps {
  stations: MetroStation[];
  lines: MetroLine[];
}

export function QuizGame({ stations, lines }: QuizGameProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentStation: null,
    guessedStations: [],
    totalStations: 0,
    score: 0,
    timeElapsed: 0,
    isPaused: false,
    isGameActive: false,
    showConnections: false,
    selectedLine: undefined,
    searchInput: ''
  });

  const [settings, setSettings] = useState<QuizSettings>({
    showConnections: true,
    selectedLines: [],
    selectedModes: ['METRO'],
    randomOrder: true
  });

  const [showSettings, setShowSettings] = useState(false);
  const [gameStations, setGameStations] = useState<MetroStation[]>([]);
  const [savedScores, setSavedScores] = useState<QuizScore[]>([]);
  const [showScores, setShowScores] = useState(false);
  const [lastFoundStation, setLastFoundStation] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [resetTimerTrigger, setResetTimerTrigger] = useState(false);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [showGlobalAnswers, setShowGlobalAnswers] = useState(false);

  // Authentication state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState({
    authCode: ''
  });

  // Load saved scores and auth state on component mount
  useEffect(() => {
    // Load authentication state
    const savedAuth = localStorage.getItem('metro-quiz-auth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setAuthState(auth);
      } catch (error) {
        console.error('Error loading auth state:', error);
      }
    }
    setAuthLoading(false);
  }, []);

  // Maintain a CSS variable for the global sticky header height to offset inner sticky line headers
  useEffect(() => {
    const updateStickyHeight = () => {
      const el = stickyHeaderRef.current;
      if (!el) return;
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--global-sticky-height', `${height}px`);
    };

    // Initial measure
    updateStickyHeight();

    // Recalculate on resize
    window.addEventListener('resize', updateStickyHeight);

    // Recalculate when UI that can change header height toggles
    const raf = requestAnimationFrame(updateStickyHeight);

    return () => {
      window.removeEventListener('resize', updateStickyHeight);
      cancelAnimationFrame(raf);
    };
  }, [showSettings, showScores, quizState.isGameActive]);

  // Load saved scores when component mounts (regardless of auth state)
  useEffect(() => {
    if (!authLoading) {
      const stored = localStorage.getItem('metro-quiz-scores');
      if (stored) {
        try {
          const scores = JSON.parse(stored).map((score: QuizScore) => ({
            ...score,
            date: new Date(score.date),
            username: score.username || 'Unknown' // Handle old scores without username
          }));
          setSavedScores(scores);
        } catch (error) {
          console.error('Error loading scores:', error);
        }
      }
    }
  }, [authLoading]);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('metro-quiz-scores', JSON.stringify(savedScores));
  }, [savedScores]);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('metro-quiz-auth', JSON.stringify(authState));
  }, [authState]);

  // Filter stations based on selected lines and modes - show stations on all their lines
  const filteredStations = useMemo(() => {
    let result = stations;
    
    // Filter by modes
    if (settings.selectedModes.length > 0) {
      result = result.filter(station => settings.selectedModes.includes(station.mode));
    }
    
    // Filter by lines
    if (settings.selectedLines.length > 0) {
      result = result.filter(station => settings.selectedLines.includes(station.line));
    }
    
    return result;
  }, [stations, settings.selectedModes, settings.selectedLines]);

  // Get unique station names for scoring (same station name across multiple lines should count as one)
  const uniqueStationNames = useMemo(() => {
    const uniqueNames = new Set<string>();
    filteredStations.forEach(station => {
      uniqueNames.add(normalizeStationName(station.nom_long));
    });
    return uniqueNames;
  }, [filteredStations]);

  // Real-time search and station matching
  const handleSearchChange = useCallback((value: string) => {
    if (!quizState.isGameActive) return;
    
    setQuizState(prev => ({ ...prev, searchInput: value }));
    
    // Check for matches when user types (exact matching required)
    if (value.trim().length >= 1) {
      const matches = filteredStations.filter(station => {
        return fuzzyMatch(value, station.nom_long, station.nom_so_gar);
      });
      
      // Reveal matching stations that haven't been guessed yet
      let foundNew = false;
      const newGuessedStations = [...quizState.guessedStations];
      const uniqueNewStations = new Set<string>();
      
      matches.forEach(station => {
        const stationKey = normalizeStationName(station.nom_long);
        if (!quizState.guessedStations.includes(stationKey)) {
          foundNew = true;
          newGuessedStations.push(stationKey);
          uniqueNewStations.add(stationKey);
        }
      });
      
      // Only increment score by the number of unique stations found
      if (foundNew) {
        setQuizState(prev => ({
          ...prev,
          guessedStations: newGuessedStations,
          score: prev.score + uniqueNewStations.size
        }));
      }
      
      // Clear the search input after a successful match
      if (foundNew) {
        setTimeout(() => {
          setQuizState(prev => ({ ...prev, searchInput: '' }));
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100); // Reduced from 800ms to 100ms for faster clearing
      }
    }
  }, [filteredStations, quizState.guessedStations, quizState.isGameActive]);

  // Initialize game when settings change
  useEffect(() => {
    const stationsToUse = settings.randomOrder 
      ? shuffleArray(filteredStations) 
      : filteredStations;
    
    setGameStations(stationsToUse);
    setQuizState(prev => ({
      ...prev,
      currentStation: stationsToUse[0] || null,
      totalStations: uniqueStationNames.size, // Use unique count for scoring
      guessedStations: [],
      score: 0,
      showConnections: settings.showConnections,
      searchInput: ''
    }));
  }, [filteredStations, uniqueStationNames, settings]);

  // Focus search input when game starts
  useEffect(() => {
    if (quizState.isGameActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [quizState.isGameActive]);

  // Check for game completion
  useEffect(() => {
    if (quizState.isGameActive && quizState.score === uniqueStationNames.size && uniqueStationNames.size > 0) {
      // Game completed - save score automatically only if authenticated
      if (authState.isAuthenticated && authState.user) {
        const percentage = uniqueStationNames.size > 0 ? Math.round((quizState.score / uniqueStationNames.size) * 100) : 0;
        
        const newScore: QuizScore = {
          id: Date.now().toString(),
          score: quizState.score,
          totalStations: uniqueStationNames.size,
          timeElapsed: quizState.timeElapsed,
          percentage,
          date: new Date(),
          modes: settings.selectedModes,
          lines: settings.selectedLines,
          username: authState.user.username
        };

        setSavedScores(prev => [newScore, ...prev].slice(0, 10)); // Keep only last 10 scores
      }
      setQuizState(prev => ({ ...prev, isGameActive: false }));
    }
  }, [quizState.score, uniqueStationNames.size, quizState.isGameActive, quizState.timeElapsed, settings.selectedModes, settings.selectedLines, authState.isAuthenticated, authState.user]);

  const startGame = () => {
    if (filteredStations.length === 0) {
      alert('Please select at least one transport mode or line to start the quiz!');
      return;
    }

    setQuizState(prev => ({
      ...prev,
      isGameActive: true,
      isPaused: false,
      guessedStations: [],
      score: 0,
      timeElapsed: 0,
      searchInput: ''
    }));
    setLastFoundStation('');
  };

  const pauseGame = () => {
    setQuizState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const stopGame = () => {
    if (quizState.isGameActive && quizState.score > 0 && authState.isAuthenticated) {
      // Save score when stopping an active game (only if authenticated)
      saveCurrentScore();
    }
    
    // Reset and unfold timer
    setResetTimerTrigger(prev => !prev);
    
    setQuizState(prev => ({
      ...prev,
      isGameActive: false,
      isPaused: false,
      searchInput: ''
    }));
    setLastFoundStation('');
  };

  const saveCurrentScore = () => {
    if (!authState.user) return;
    
    const percentage = gameStations.length > 0 ? Math.round((quizState.score / uniqueStationNames.size) * 100) : 0;
    
    const newScore: QuizScore = {
      id: Date.now().toString(),
      score: quizState.score,
      totalStations: gameStations.length,
      timeElapsed: quizState.timeElapsed,
      percentage,
      date: new Date(),
      modes: settings.selectedModes,
      lines: settings.selectedLines,
      username: authState.user.username
    };

    setSavedScores(prev => [newScore, ...prev].slice(0, 10)); // Keep only last 10 scores
  };

  const deleteScore = (scoreId: string) => {
    setSavedScores(prev => prev.filter(score => score.id !== scoreId));
  };

  const clearAllScores = () => {
    setSavedScores([]);
  };

  // Authentication functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.authCode.trim()) {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authCode: loginForm.authCode.trim() }),
        });

        const data = await response.json();

        if (data.success && data.user) {
          const user: User = {
            id: data.user.id,
            username: data.user.username,
            hash: loginForm.authCode.trim(),
            createdAt: data.user.createdAt
          };
          
          setAuthState({
            isAuthenticated: true,
            user
          });
          
          setShowLoginForm(false);
          setLoginForm({ authCode: '' });
        } else {
          alert(data.error || 'Invalid auth code');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setSavedScores([]);
  };

  const toggleShowConnections = () => {
    const newValue = !settings.showConnections;
    setSettings(prev => ({
      ...prev,
      showConnections: newValue
    }));
    setQuizState(prev => ({
      ...prev,
      showConnections: newValue
    }));
  };

  const handleTimeUpdate = useCallback((seconds: number) => {
    setQuizState(prev => ({
      ...prev,
      timeElapsed: seconds
    }));
  }, []);

  const progress = uniqueStationNames.size > 0 ? (quizState.score / uniqueStationNames.size) * 100 : 0;
  // Dynamic sticky header offset calculation
  useEffect(() => {
    const updateOffset = () => {
      if (stickyHeaderRef.current) {
        document.documentElement.style.setProperty(
          '--header-offset', 
          `${stickyHeaderRef.current.offsetHeight}px`
        );
      }
    };
    
    updateOffset();
    window.addEventListener('resize', updateOffset);
    
    // Also update after a short delay to account for dynamic content (e.g. settings appearing)
    const timer = setTimeout(updateOffset, 100);
    
    return () => {
      window.removeEventListener('resize', updateOffset);
      clearTimeout(timer);
    };
  }, [showSettings, showScores, quizState.isGameActive]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Sticky Header Container */}
      <div ref={stickyHeaderRef} className="sticky top-20 bg-card z-50 shadow-sm mb-6 transition-colors duration-300">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center py-4">
            <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">
              Quiz des Transports
            </h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest">
              Identifiez les gares du réseau pour valider votre expertise
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Timer 
              autoStart={quizState.isGameActive && !quizState.isPaused}
              onTimeUpdate={handleTimeUpdate}
              resetTrigger={resetTimerTrigger}
            />
            
            <div className="flex gap-2 flex-wrap">
              {/* Authentication button */}
              {authLoading ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              ) : authState.isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <UserIcon size={16} />
                    {authState.user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-[11px] font-bold"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(!showLoginForm)}
                  className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all text-[11px] font-bold"
                >
                  <LogIn size={16} />
                  Connexion
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-4 py-2 border border-border text-[11px] font-bold transition-all ${showSettings ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'}`}
              >
                <Settings size={16} />
                Paramètres
              </button>
              
              <button
                onClick={() => setShowScores(!showScores)}
                className={`flex items-center gap-2 px-4 py-2 border border-border text-[11px] font-bold transition-all ${showScores ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'}`}
                disabled={authLoading}
              >
                <Trophy size={16} />
                Scores
              </button>
              
              <button
                onClick={toggleShowConnections}
                className={`flex items-center gap-2 px-4 py-2 border border-border text-[11px] font-bold transition-all ${
                  settings.showConnections
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                {settings.showConnections ? <Eye size={16} /> : <EyeOff size={16} />}
                {settings.showConnections ? 'Masquer' : 'Afficher'} Corresp.
              </button>
              
              {!quizState.isGameActive ? (
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border border-border hover:opacity-80 transition-colors text-[11px] font-bold uppercase tracking-wide"
                >
                  <Play size={16} />
                  Lancer le Quiz
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseGame}
                    className="flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all text-[11px] font-bold"
                  >
                    <Pause size={16} />
                    {quizState.isPaused ? 'Reprendre' : 'Pause'}
                  </button>
                  
                  <button
                    onClick={stopGame}
                    className="flex items-center gap-2 px-4 py-2 border border-border bg-accent text-accent-foreground hover:opacity-90 transition-all text-[11px] font-bold"
                  >
                    <RotateCcw size={16} />
                    Sauvegarder
                  </button>
                </>
              )}

              <button
                onClick={() => setShowGlobalAnswers(!showGlobalAnswers)}
                className={`flex items-center gap-2 px-4 py-2 border border-border text-[11px] font-bold transition-all ${
                  showGlobalAnswers 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-card text-foreground hover:bg-muted'
                }`}
              >
                {showGlobalAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
                {showGlobalAnswers ? 'Masquer les solutions' : 'Afficher les solutions'}
              </button>
            </div>
          </div>

          {/* Search Input - Only show during active quiz */}
          {quizState.isGameActive && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
                <input
                ref={searchInputRef}
                type="text"
                value={quizState.searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tapez le nom d'une gare..."
                disabled={quizState.isPaused}
                className="block w-full px-8 py-4 border border-border bg-card text-foreground placeholder-gray-400 focus:outline-none focus:bg-accent focus:text-accent-foreground text-xl font-black tracking-tight font-parisine transition-colors"
              />
              {lastFoundStation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-2 py-1 rounded text-sm animate-pulse">
                  Found: {lastFoundStation}
                </div>
              )}
            </div>
          )}

          {/* Progress (Now inside sticky header) */}
          {gameStations.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-400 tracking-wider">Progression globale</span>
                <span className="text-[10px] font-black text-gray-600 dark:text-gray-400">
                  {quizState.score} / {uniqueStationNames.size} gares ({Math.round(progress)}%)
                </span>
              </div>
              <div className="w-full bg-muted h-2">
                <div 
                  className="bg-accent h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Connexion</h3>
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-foreground/60 mb-4 text-sm">
              Entrez votre code d'authentification pour sauvegarder vos scores et suivre votre progression.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="authCode" className="block text-sm font-medium text-foreground/70 mb-1">
                  Code d'authentification
                </label>
                <input
                  type="text"
                  id="authCode"
                  value={loginForm.authCode}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, authCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Entrez votre code..."
                  required
                />
                <p className="text-xs text-foreground/40 mt-1">
                  Contactez l'administrateur pour obtenir votre code d'authentification
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground border border-border px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 bg-muted text-foreground border border-border px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="px-6 space-y-6">


      {/* Settings Panel */}
      {showSettings && (
        <LineFilter
          lines={lines}
          selectedLines={settings.selectedLines}
          selectedModes={settings.selectedModes}
          onSelectionChange={(selectedLines) => 
            setSettings(prev => ({ ...prev, selectedLines }))
          }
          onModeChange={(selectedModes) => 
            setSettings(prev => ({ ...prev, selectedModes }))
          }
        />
      )}

      {/* Scores Panel */}
      {showScores && !authLoading && (
        <div className="bg-card p-6 shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-foreground">Scores Récents</h3>
            <div className="flex gap-2">
              {savedScores.length > 0 && authState.isAuthenticated && (
                <button
                  onClick={clearAllScores}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Effacer tout
                </button>
              )}
              <button
                onClick={() => setShowScores(false)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                <X size={16} />
                Fermer
              </button>
            </div>
          </div>
          
          {/* Authentication notice for non-logged users */}
          {!authState.isAuthenticated && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
                <LogIn size={16} />
                <span className="font-medium text-[10px] tracking-widest">Connectez-vous pour sauvegarder</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-[10px] mt-1 font-bold">
                Vous pouvez voir tous les scores, mais la connexion est requise pour sauvegarder vos propres résultats.
              </p>
            </div>
          )}
          
          {savedScores.length === 0 ? (
            <p className="text-foreground/40 text-center py-8 font-bold uppercase text-xs">Aucun score sauvegardé. Terminez un quiz pour voir les résultats ici !</p>
          ) : (
            <div className="space-y-3">
              {savedScores.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="font-bold text-lg text-green-600">{score.percentage}%</span>
                      <span className="text-foreground font-medium">
                        {score.score} / {score.totalStations} gares
                      </span>
                      <span className="text-foreground/60 font-bold">
                        {Math.floor(score.timeElapsed / 60)}:{(score.timeElapsed % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-black uppercase text-accent-foreground bg-accent px-2 py-1">
                        {score.username}
                      </span>
                    </div>
                    <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">
                      {score.date.toLocaleDateString()} {score.date.toLocaleTimeString()} • 
                      {score.modes.join(', ')} • 
                      {score.lines.length > 0 ? score.lines.join(', ') : 'Toutes les lignes'}
                    </div>
                  </div>
                  {authState.isAuthenticated && (
                    <button
                      onClick={() => deleteScore(score.id)}
                      className="ml-3 p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Supprimer ce score"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Game Complete */}
      {!quizState.isGameActive && quizState.score === uniqueStationNames.size && uniqueStationNames.size > 0 && (
        <div className="space-y-4">
          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
            <Trophy size={48} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2 font-parisine">
              Félicitations ! 🎉
            </h2>
            <p className="text-green-700 font-bold uppercase text-[10px] tracking-widest">
              Vous avez identifié les {uniqueStationNames.size} gares en {Math.floor(quizState.timeElapsed / 60)}:{(quizState.timeElapsed % 60).toString().padStart(2, '0')} !
            </p>
          </div>
          
          {/* Score not saved warning */}
          {!authState.isAuthenticated && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LogIn size={20} className="text-yellow-600" />
                <span className="font-bold uppercase text-xs text-yellow-800">Score non sauvegardé</span>
              </div>
              <p className="text-yellow-700 text-[10px] mb-3 font-bold uppercase">
                Votre score n'a pas été sauvegardé car vous n'êtes pas connecté. Connectez-vous pour suivre votre progression !
              </p>
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-yellow-500 text-white border-2 border-yellow-600 px-4 py-2 font-black uppercase text-[10px] hover:bg-yellow-600 transition-colors"
                >
                  Se connecter pour sauvegarder
                </button>
            </div>
          )}
        </div>
      )}

      {/* Quiz Table */}
      {gameStations.length > 0 && (
        <QuizTable
          stations={stations}
          filteredStations={gameStations}
          guessedStations={quizState.guessedStations}
          showAllAnswers={showGlobalAnswers}
          gameEnded={!quizState.isGameActive && quizState.score > 0}
          showConnections={settings.showConnections}
          isAuthenticated={authState.isAuthenticated}
        />
      )}

      {/* No stations available message */}
      {filteredStations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Settings size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-black uppercase text-foreground mb-2">
            Aucune gare disponible
          </h3>
          <p className="text-foreground/50 mb-4 font-bold uppercase text-[10px] tracking-widest">
            Veuillez sélectionner des modes de transport et/ou des lignes dans les paramètres pour commencer le quiz.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-accent text-accent-foreground border-2 border-border font-black uppercase tracking-widest text-xs hover:opacity-80 transition-colors"
          >
            Ouvrir les Paramètres
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
