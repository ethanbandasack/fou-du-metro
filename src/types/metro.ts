// Types for the Paris Metro Quiz Application

export interface EnrichedStation {
  nom: string;
  lines: string[];
  orders: Record<string, number>;
  lat: number;
  lon: number;
  arrondissement: number;
  figure_historique: boolean;
  couleur: boolean;
  ouverte_apres_1980: boolean;
  rive_gauche: boolean;
  has_rer: boolean;
  has_tram: boolean;
}

export interface MetroStation {
  id: string;
  gares_id: string;
  nom_long: string;
  nom_so_gar?: string;
  nom_su_gar?: string;
  line: string;
  lineColor?: string;
  mode: 'METRO' | 'RER' | 'TRAIN' | 'TRAMWAY' | 'VAL' | 'CABLE';
  exploitant: 'RATP' | 'SNCF';
  connections: string[];
  isGuessed?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  order?: number; // For manual ordering within lines
}

export interface MetroLine {
  line: string;
  mode: 'METRO' | 'RER' | 'TRAIN' | 'TRAMWAY' | 'VAL' | 'CABLE';
  color?: string;
  stations: MetroStation[];
}

export interface MetroLineData {
  line: string;
  mode: string;
  color?: string;
  stations: { name: string; connections?: string[] }[];
}

export interface QuizState {
  currentStation: MetroStation | null;
  guessedStations: string[];
  totalStations: number;
  score: number;
  timeElapsed: number;
  isPaused: boolean;
  isGameActive: boolean;
  showConnections: boolean;
  selectedLine?: string;
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
  timeLimit?: number; // in minutes
  randomOrder: boolean;
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
