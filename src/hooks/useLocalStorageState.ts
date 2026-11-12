'use client';

import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from 'react';

const listeners = new Set<() => void>();
/** Used when localStorage is unavailable (blocked storage): state then lasts until reload. */
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * State stored in localStorage and shared by every component using `key` (other tabs included).
 * The server render and hydration use `fallback`; the third value tells when the stored value is in.
 * `fallback` and `parse` must not change between renders (module-level values).
 */
export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  parse: (raw: string | null) => T
): [T, (update: SetStateAction<T>) => void, boolean] {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => (raw === undefined ? fallback : parse(raw)), [raw]);

  const setValue = useCallback(
    (update: SetStateAction<T>) => {
      const next = typeof update === 'function' ? (update as (previous: T) => T)(parse(read(key))) : update;
      write(key, JSON.stringify(next));
    },
    [key, parse]
  );

  return [value, setValue, raw !== undefined];
}
