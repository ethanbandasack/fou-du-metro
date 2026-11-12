/** Stored shape (localStorage "metro-quiz-scores"); field names kept for saved data. */
export interface QuizScore {
  id: string;
  score: number;
  totalStations: number;
  timeElapsed: number;
  percentage: number;
  /** ISO date. */
  date: string;
  modes: string[];
  lines: string[];
  username: string;
}

export const MAX_SCORES = 10;
export const SCORES_STORAGE_KEY = "metro-quiz-scores";

export function createScore(input: {
  id: string;
  found: number;
  total: number;
  elapsedSeconds: number;
  modes: string[];
  lines: string[];
  username: string;
  date: Date;
}): QuizScore {
  return {
    id: input.id,
    score: input.found,
    totalStations: input.total,
    timeElapsed: input.elapsedSeconds,
    percentage: input.total > 0 ? Math.round((input.found / input.total) * 100) : 0,
    date: input.date.toISOString(),
    modes: input.modes,
    lines: input.lines,
    username: input.username,
  };
}

export function addScore(scores: QuizScore[], score: QuizScore): QuizScore[] {
  return [score, ...scores].slice(0, MAX_SCORES);
}

export function parseStoredScores(raw: string | null): QuizScore[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.map((score: QuizScore) => ({ ...score, username: score.username || "Inconnu" }));
  } catch {
    return [];
  }
}
