'use client';

import { useLocalStorageState } from '@/hooks/useLocalStorageState';

export const HARDCORE_STORAGE_KEY = 'metro-quiz-hardcore';

export function parseFlag(raw: string | null): boolean {
  return raw === 'true';
}

/** Hardcore mode (exact names only), shared by both quizzes and remembered. */
export function useHardcore() {
  return useLocalStorageState<boolean>(HARDCORE_STORAGE_KEY, false, parseFlag);
}
