'use client';

import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Today's ISO date on the client. The server render (prerendered at build time) uses "",
 * which treats every dated station as future; the client then shows what is open today.
 */
export function useToday(): string {
  return useSyncExternalStore(noSubscription, today, () => '');
}
