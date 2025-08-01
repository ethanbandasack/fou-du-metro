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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Sticky Header Container */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 z-50 shadow-md mb-6">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Paris Transport Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Type station names to reveal them and test your knowledge!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Requires exact name matching
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
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(!showLoginForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <LogIn size={20} />
                  Login
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Settings size={20} />
                Settings
              </button>
              
              <button
                onClick={() => setShowScores(!showScores)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                disabled={authLoading}
              >
                <Trophy size={20} />
                Scores
              </button>
              
              <button
                onClick={toggleShowConnections}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  settings.showConnections
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {settings.showConnections ? <Eye size={20} /> : <EyeOff size={20} />}
                {settings.showConnections ? 'Hide' : 'Show'} Connections
              </button>
              
              {!quizState.isGameActive ? (
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play size={20} />
                  Start Quiz
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseGame}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Pause size={20} />
                    {quizState.isPaused ? 'Resume' : 'Pause'}
                  </button>
                  
                  <button
                    onClick={stopGame}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <RotateCcw size={20} />
                    Stop & Save
                  </button>
                </>
              )}
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
                placeholder="Type a station name..."
                disabled={quizState.isPaused}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {lastFoundStation && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-2 py-1 rounded text-sm animate-pulse">
                  Found: {lastFoundStation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Login to Save Scores</h3>
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Enter your authentication code to save your quiz scores and track your progress.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="authCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="authCode"
                  value={loginForm.authCode}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, authCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter your auth code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact the administrator to get your authentication code
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="px-6 space-y-6">

      {/* Progress */}
      {gameStations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {quizState.score} / {uniqueStationNames.size} stations
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-lg font-bold text-green-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>
      )}

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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Scores</h3>
            <div className="flex gap-2">
              {savedScores.length > 0 && authState.isAuthenticated && (
                <button
                  onClick={clearAllScores}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowScores(false)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
              >
                <X size={16} />
                Close
              </button>
            </div>
          </div>
          
          {/* Authentication notice for non-logged users */}
          {!authState.isAuthenticated && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
                <LogIn size={16} />
                <span className="font-medium">Login to save your scores</span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                You can view all scores, but login is required to save your own quiz results.
              </p>
            </div>
          )}
          
          {savedScores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scores saved yet. Complete a quiz to see results here!</p>
          ) : (
            <div className="space-y-3">
              {savedScores.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="font-bold text-lg text-green-600">{score.percentage}%</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {score.score} / {score.totalStations} stations
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.floor(score.timeElapsed / 60)}:{(score.timeElapsed % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        {score.username}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {score.date.toLocaleDateString()} {score.date.toLocaleTimeString()} • 
                      {score.modes.join(', ')} • 
                      {score.lines.length > 0 ? score.lines.join(', ') : 'All lines'}
                    </div>
                  </div>
                  {authState.isAuthenticated && (
                    <button
                      onClick={() => deleteScore(score.id)}
                      className="ml-3 p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete this score"
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
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-green-700">
              You&apos;ve identified all {uniqueStationNames.size} stations in {Math.floor(quizState.timeElapsed / 60)}:{(quizState.timeElapsed % 60).toString().padStart(2, '0')}!
            </p>
          </div>
          
          {/* Score not saved warning */}
          {!authState.isAuthenticated && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <LogIn size={20} className="text-yellow-600" />
                <span className="font-semibold text-yellow-800">Score Not Saved</span>
              </div>
              <p className="text-yellow-700 text-sm mb-3">
                Your score wasn&apos;t saved because you&apos;re not logged in. Login to save your progress and track your improvements!
              </p>
              <button
                onClick={() => setShowLoginForm(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Login to Save Scores
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
          showAllAnswers={false}
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Stations Available
          </h3>
          <p className="text-gray-500 mb-4">
            Please select transport modes and/or lines from the settings to start the quiz.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open Settings
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
