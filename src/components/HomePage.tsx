'use client';

import React, { useState } from 'react';
import { QuizGame } from '@/components/QuizGame';
import { IntersectionQuiz } from '@/components/IntersectionQuiz';
import { MetroStation, MetroLine, EnrichedStation } from '@/types/metro';
import { LayoutGrid, Blend } from 'lucide-react';

interface HomePageProps {
  stations: MetroStation[];
  lines: MetroLine[];
  enrichedStations: EnrichedStation[];
}

export default function HomePage({ stations, lines, enrichedStations }: HomePageProps) {
  const [activeQuiz, setActiveQuiz] = useState<'classic' | 'intersection'>('classic');

  return (
    <div className="min-h-screen bg-muted border-x-2 border-border max-w-[1400px] mx-auto transition-colors duration-300">
      <nav className="bg-card border-b-2 border-border sticky top-0 z-[70] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl grayscale">🚇</span>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter uppercase">Fou du métro</span>
            </div>
          </div>

          <div className="flex border-2 border-border">
            <button 
              onClick={() => setActiveQuiz('classic')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase transition-all ${activeQuiz === 'classic' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            >
              <LayoutGrid size={14} />
              Classique
            </button>
            <button 
              onClick={() => setActiveQuiz('intersection')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase transition-all ${activeQuiz === 'intersection' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            >
              <Blend size={14} />
              Intersection
            </button>
          </div>
        </div>
      </nav>

      <main className="">
        {activeQuiz === 'classic' ? (
          <div className="py-12 px-6">
            <QuizGame stations={stations} lines={lines} />
          </div>
        ) : (
          <IntersectionQuiz allStations={enrichedStations} />
        )}
      </main>
      
      <footer className="border-t-2 border-border p-8 text-center bg-card transition-colors duration-300">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© Pseudo, 2025-2026</p>
      </footer>
    </div>
  );
}
