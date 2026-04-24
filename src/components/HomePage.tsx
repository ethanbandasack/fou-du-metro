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
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-900 border-x-2 border-black dark:border-white max-w-[1400px] mx-auto">
      <nav className="bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white sticky top-0 z-[70]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl grayscale">🚇</span>
            <div className="flex flex-col -space-y-1">
              <span className="font-black text-2xl tracking-tighter uppercase">Fou du métro</span>
            </div>
          </div>

          <div className="flex border-2 border-black dark:border-white">
            <button 
              onClick={() => setActiveQuiz('classic')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase transition-all ${activeQuiz === 'classic' ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <LayoutGrid size={14} />
              Classique
            </button>
            <button 
              onClick={() => setActiveQuiz('intersection')}
              className={`flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase transition-all ${activeQuiz === 'intersection' ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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
      
      <footer className="border-t-2 border-black dark:border-white p-8 text-center bg-white dark:bg-gray-900">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">© Pseudo, 2025-2026</p>
      </footer>
    </div>
  );
}
