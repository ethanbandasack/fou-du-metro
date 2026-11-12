/** Logged-in player, as kept in localStorage. The login code itself is never stored. */
export interface Player {
  id: string;
  username: string;
}

export const PLAYER_STORAGE_KEY = "metro-quiz-auth";

type Stored = Partial<Player> & { isAuthenticated?: boolean; user?: Partial<Player> | null };

export function parseStoredPlayer(raw: string | null): Player | null {
  try {
    const data = JSON.parse(raw ?? "null") as Stored | null;
    // Legacy format: { isAuthenticated, user: { id, username, hash, createdAt } }
    const player = data && "isAuthenticated" in data ? (data.isAuthenticated ? data.user : null) : data;
    return player?.id && player.username ? { id: player.id, username: player.username } : null;
  } catch {
    return null;
  }
}
