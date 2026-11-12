'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * State mirrored in localStorage. Starts from `fallback` (server render),
 * loads the stored value after mount, then saves every change.
 */
export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  parse: (raw: string | null) => T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setValue(parse(localStorage.getItem(key)));
    } catch {
      // Storage unavailable (private mode, blocked cookies): keep the fallback.
    }
    setLoaded(true);
    // Load once per key; `parse` is expected to be a stable module function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota or availability errors.
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded];
}
