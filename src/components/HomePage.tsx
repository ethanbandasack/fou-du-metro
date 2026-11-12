'use client';

import React, { useState } from 'react';
import { QuizGame } from '@/features/classic/QuizGame';
import { IntersectionQuiz } from '@/features/intersection/IntersectionQuiz';
import type { Network } from '@/domain/network';
import { openStations } from '@/domain/selection';
import { useToday } from '@/hooks/useToday';
import { LayoutGrid, Blend } from 'lucide-react';

export default function HomePage({ network }: { network: Network }) {
  const [activeQuiz, setActiveQuiz] = useState<'classic' | 'intersection'>('classic');
  const today = useToday();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <nav className="bg-card sticky top-0 z-[70] transition-colors duration-300 shadow-sm w-full border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[var(--nav-height)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline text-3xl grayscale" aria-hidden>🚇</span>
            <span className="font-black text-lg sm:text-2xl tracking-tighter whitespace-nowrap">Fou du métro</span>
          </div>

          <div className="flex bg-muted rounded-lg p-1 shrink-0">
            <button 
              onClick={() => setActiveQuiz('classic')}
              aria-pressed={activeQuiz === 'classic'}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2 text-[11px] font-bold transition-all rounded-md ${activeQuiz === 'classic' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <LayoutGrid size={14} />
              Classique
            </button>
            <button 
              onClick={() => setActiveQuiz('intersection')}
              aria-pressed={activeQuiz === 'intersection'}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2 text-[11px] font-bold transition-all rounded-md ${activeQuiz === 'intersection' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <Blend size={14} />
              Intersection
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto">
        <main className="">
          {activeQuiz === 'classic' ? (
            <div className="py-6 sm:py-12 px-4 sm:px-6">
              <QuizGame lines={network.lines} />
            </div>
          ) : (
            <div className="py-6 sm:py-12 px-4 sm:px-6">
              <IntersectionQuiz allStations={openStations(network.stations, network.lines, today)} />
            </div>
          )}
        </main>
        
        <footer className="p-8 text-center bg-card transition-colors duration-300">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest">© Pseudo, 2025-2026</p>
        </footer>
      </div>
    </div>
  );
}
