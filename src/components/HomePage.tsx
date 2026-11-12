'use client';

import React, { useState } from 'react';
import { QuizGame } from '@/features/classic/QuizGame';
import { IntersectionQuiz } from '@/features/intersection/IntersectionQuiz';
import type { Network } from '@/domain/network';
import { LayoutGrid, Blend } from 'lucide-react';

export default function HomePage({ network }: { network: Network }) {
  const [activeQuiz, setActiveQuiz] = useState<'classic' | 'intersection'>('classic');

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <nav className="bg-card sticky top-0 z-[70] transition-colors duration-300 shadow-sm w-full border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl grayscale">🚇</span>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter">Fou du métro</span>
            </div>
          </div>

          <div className="flex bg-muted rounded-lg p-1">
            <button 
              onClick={() => setActiveQuiz('classic')}
              className={`flex items-center gap-2 px-6 py-2 text-[11px] font-bold transition-all rounded-md ${activeQuiz === 'classic' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <LayoutGrid size={14} />
              Classique
            </button>
            <button 
              onClick={() => setActiveQuiz('intersection')}
              className={`flex items-center gap-2 px-6 py-2 text-[11px] font-bold transition-all rounded-md ${activeQuiz === 'intersection' ? 'bg-card text-foreground shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
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
            <div className="py-12 px-6">
              <QuizGame lines={network.lines} />
            </div>
          ) : (
            <div className="py-12 px-6">
              <IntersectionQuiz allStations={network.stations} />
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
