// Types for the Paris Metro Quiz Application

export interface QuizState {
  guessedStations: string[];
  totalStations: number;
  score: number;
  timeElapsed: number;
  isPaused: boolean;
  isGameActive: boolean;
  showConnections: boolean;
  searchInput: string;
}

export interface QuizScore {
  id: string;
  score: number;
  totalStations: number;
  timeElapsed: number;
  percentage: number;
  date: Date;
  modes: string[];
  lines: string[];
  username: string;
}

export interface TimerState {
  seconds: number;
  minutes: number;
  hours: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface QuizSettings {
  showConnections: boolean;
  selectedLines: string[];
  selectedModes: string[];
}

export interface User {
  id: string;
  username: string;
  hash: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
