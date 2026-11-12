'use client';

import { useCallback } from 'react';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { parseStoredPlayer, PLAYER_STORAGE_KEY, type Player } from '@/features/auth/session';

export function useAuth() {
  const [player, setPlayer, loaded] = useLocalStorageState<Player | null>(PLAYER_STORAGE_KEY, null, parseStoredPlayer);

  /** Resolves to an error message, or null on success. */
  const login = useCallback(async (code: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authCode: code.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.user) return data.error ?? 'Code invalide';
      setPlayer({ id: data.user.id, username: data.user.username });
      return null;
    } catch {
      return 'Connexion impossible. Réessayez.';
    }
  }, [setPlayer]);

  const logout = useCallback(() => setPlayer(null), [setPlayer]);

  return { player, loading: !loaded, login, logout };
}
