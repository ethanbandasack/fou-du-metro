'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { EnrichedStation } from '@/types/metro';
import { 
  getAvailableCategories, 
  MetaCategories, 
  Category, 
  LINE_COLORS 
} from '@/utils/intersectionUtils';
import { 
  Search, 
  Shuffle, 
  RotateCcw, 
  Trophy, 
  Info, 
  Moon, 
  Sun, 
  Settings2,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { normalizeStationName, fuzzyMatch } from '@/utils/metroUtils';

interface IntersectionQuizProps {
  allStations: EnrichedStation[];
}

export function IntersectionQuiz({ allStations }: IntersectionQuizProps) {
  const [gameMode, setGameMode] = useState<'intersection' | 'single'>('intersection');
  const [meta1, setMeta1] = useState<string>('line');
  const [meta2, setMeta2] = useState<string>('geo');
  const [sub1, setSub1] = useState<string>('');
  const [sub2, setSub2] = useState<string>('');
  const [customLines, setCustomLines] = useState<string>('');
  const [customArrs, setCustomArrs] = useState<string>('');
  
  const [targetStations, setTargetStations] = useState<string[]>([]);
  const [foundStations, setFoundStations] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => 
    getAvailableCategories(allStations, customLines, customArrs), 
    [allStations, customLines, customArrs]
  );

  const flatPool = useMemo(() => Object.values(categories).flat(), [categories]);

  // Handle random category selection
  const handleRandomSub = (index: 1 | 2) => {
    const meta = index === 1 ? meta1 : meta2;
    const cats = categories[meta] || [];
    const validCats = cats.filter(c => !c.id.startsWith('random-'));
    if (validCats.length > 0) {
      const randomCat = validCats[Math.floor(Math.random() * validCats.length)];
      if (index === 1) setSub1(randomCat.id);
      else setSub2(randomCat.id);
    }
  };

  const shuffleAll = () => {
    const metas = Object.keys(MetaCategories).filter(m => m !== 'custom');
    const m1 = metas[Math.floor(Math.random() * metas.length)];
    const m2 = metas[Math.floor(Math.random() * metas.length)];
    setMeta1(m1);
    setMeta2(m2);
    // Values will be updated by useEffect
  };

  // Sync subcategories when meta changes
  useEffect(() => {
    if (!sub1 || !categories[meta1]?.find(c => c.id === sub1)) {
        handleRandomSub(1);
    }
  }, [meta1, categories]);

  useEffect(() => {
    if (!sub2 || !categories[meta2]?.find(c => c.id === sub2)) {
        handleRandomSub(2);
    }
  }, [meta2, categories]);

  // Setup/Refresh Game Logic
  const setupGame = useCallback(() => {
    if (allStations.length === 0) return;
    
    const catA = flatPool.find(c => c.id === sub1);
    const catB = flatPool.find(c => c.id === sub2);
    
    if (!catA) return;

    let targets: string[] = [];
    if (gameMode === 'intersection') {
      if (!catB) return;
      const stationsA = allStations.filter(catA.filter);
      const stationsB = allStations.filter(catB.filter);
      targets = stationsA.filter(s => stationsB.some(s2 => s2.nom === s.nom)).map(s => s.nom);
    } else {
      targets = allStations.filter(catA.filter).map(s => s.nom);
    }

    setTargetStations([...new Set(targets)]);
    setFoundStations([]);
    setRevealed(false);
    setSearchInput('');
  }, [allStations, flatPool, sub1, sub2, gameMode]);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchInput.trim();
    if (!val) return;

    const matchedStation = allStations.find(s => 
      fuzzyMatch(val, s.nom)
    );

    if (matchedStation && targetStations.includes(matchedStation.nom)) {
      if (!foundStations.includes(matchedStation.nom)) {
        setFoundStations(prev => [...prev, matchedStation.nom]);
        setSearchInput('');
      } else {
        triggerError();
      }
    } else {
      triggerError();
    }
  };

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const revealAll = () => {
    setRevealed(true);
  };

  const currentCatA = flatPool.find(c => c.id === sub1);
  const currentCatB = flatPool.find(c => c.id === sub2);

  const progress = targetStations.length > 0 ? (foundStations.length / targetStations.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Config Panel */}
      <section className="bg-[#f5f5f5] dark:bg-gray-800 border-2 border-black dark:border-white p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b-2 border-black dark:border-white pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              METRO INTERSECTION
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calculateur de correspondances parisiennes</p>
          </div>
          
          <div className="flex border-2 border-black dark:border-white">
            <button 
              onClick={() => setGameMode('intersection')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all ${gameMode === 'intersection' ? 'bg-black text-white' : 'bg-white text-black dark:bg-gray-700 dark:text-white'}`}
            >
              Intersection
            </button>
            <button 
              onClick={() => setGameMode('single')}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all ${gameMode === 'single' ? 'bg-black text-white' : 'bg-white text-black dark:bg-gray-700 dark:text-white'}`}
            >
              Simple
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Criterion A */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">CRITÈRE ALPHA</label>
            <div className="flex flex-col gap-1">
              <select 
                value={meta1}
                onChange={(e) => setMeta1(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-2 text-sm font-bold appearance-none"
              >
                {Object.entries(MetaCategories).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <select 
                value={sub1}
                onChange={(e) => setSub1(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-2 text-sm font-bold appearance-none"
                disabled={meta1 === 'custom'}
              >
                {categories[meta1]?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Criterion B */}
          {gameMode === 'intersection' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">CRITÈRE BÊTA</label>
              <div className="flex flex-col gap-1">
                <select 
                  value={meta2}
                  onChange={(e) => setMeta2(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-2 text-sm font-bold appearance-none"
                >
                  {Object.entries(MetaCategories).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <select 
                  value={sub2}
                  onChange={(e) => setSub2(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white p-2 text-sm font-bold appearance-none"
                  disabled={meta2 === 'custom'}
                >
                  {categories[meta2]?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Custom Inputs */}
        {(meta1 === 'custom' || meta2 === 'custom') && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-black dark:border-white p-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">Lignes (ex: 1, 4, 14)</label>
                    <input 
                        type="text" 
                        value={customLines}
                        onChange={(e) => setCustomLines(e.target.value)}
                        placeholder="1, 7, 13..."
                        className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white py-2 px-3 text-sm font-bold"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">Arr. (ex: 1, 8, 15, 92)</label>
                    <input 
                        type="text" 
                        value={customArrs}
                        onChange={(e) => setCustomArrs(e.target.value)}
                        placeholder="Arrondissements..."
                        className="w-full bg-white dark:bg-gray-900 border-2 border-black dark:border-white py-2 px-3 text-sm font-bold"
                    />
                </div>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-12">
          <button 
            onClick={shuffleAll}
            className="flex-1 bg-white hover:bg-black hover:text-white dark:bg-gray-900 border-2 border-black dark:border-white text-xs font-black uppercase py-4 transition-all"
          >
            Mélange Aléatoire
          </button>
          <button 
            onClick={setupGame}
            className="flex-[2] bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white border-2 border-black dark:border-white text-xs font-black uppercase py-4 transition-all"
          >
            Générer Nouveau Quiz
          </button>
        </div>
      </section>

      {/* Gameplay Section */}
      <section className="space-y-12">
        <div className="flex flex-col items-center gap-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="border-2 border-black dark:border-white px-6 py-2 bg-white dark:bg-gray-900">
                    <span className="text-xl font-black uppercase tracking-tighter">
                        {currentCatA?.name}
                    </span>
                </div>
                {gameMode === 'intersection' && (
                    <>
                        <span className="text-4xl font-black">×</span>
                        <div className="border-2 border-black dark:border-white px-6 py-2 bg-white dark:bg-gray-900">
                            <span className="text-xl font-black uppercase tracking-tighter">
                                {currentCatB?.name}
                            </span>
                        </div>
                    </>
                )}
            </div>
            
            <div className="text-center">
                <div className="text-6xl font-black tracking-tighter mb-1">
                    {targetStations.length}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stations à identifier</div>
            </div>
        </div>

        {/* Status Bar */}
        <div className="w-full max-w-lg mx-auto flex justify-between items-end border-b-2 border-black dark:border-white pb-2 px-1">
            <div className="space-y-1 text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Progression</div>
                <div className="text-2xl font-black leading-none">{foundStations.length} / {targetStations.length}</div>
            </div>
            <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Ratio</div>
                <div className="text-2xl font-black leading-none">{Math.round(progress)}%</div>
            </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGuess} className="max-w-2xl mx-auto space-y-4">
          <div className="relative group">
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tapez le nom d'une gare..."
              disabled={revealed || (targetStations.length === 0)}
              className={`w-full bg-white dark:bg-gray-900 border-4 border-black dark:border-white py-6 px-8 text-2xl font-black uppercase tracking-tight outline-none transition-all placeholder:text-gray-200 ${errorShake ? 'animate-shake border-red-600' : 'focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black'}`}
            />
          </div>
          <div className="flex justify-between items-center px-1">
             <button 
                type="button"
                onClick={revealAll}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors"
             >
                [ Abandonner / Voir Réponses ]
             </button>
             {errorShake && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Erreur de saisie</span>}
          </div>
        </form>

        {/* Station Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[1px] bg-black dark:bg-white border-[1px] border-black dark:border-white">
             {targetStations.map(name => {
                 const isFound = foundStations.includes(name);
                 const station = allStations.find(s => s.nom === name);
                 
                 if (!isFound && !revealed) return null;

                 return (
                     <div 
                        key={name}
                        className={`p-6 flex flex-col bg-white dark:bg-gray-900 transition-all ${isFound ? '' : 'opacity-50 grayscale'}`}
                     >
                        <div className="flex justify-between items-start mb-4">
                             <span className="text-sm font-black uppercase tracking-tight leading-tight">
                                {name}
                             </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                            {station?.lines.map(l => (
                                <span 
                                    key={l}
                                    className="w-8 h-8 flex items-center justify-center text-xs font-black border-2 border-black dark:border-white"
                                    style={{ backgroundColor: isFound ? (LINE_COLORS[l] || '#000') : '#ccc', color: isFound ? 'white' : '#666' }}
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                     </div>
                 );
             })}
        </div>

        {targetStations.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-black dark:border-white">
                <p className="text-sm font-black uppercase tracking-widest">NÉANT LOGIQUE</p>
                <p className="text-[10px] mt-2 text-gray-500 font-bold">AUCUNE STATION DANS CETTE INTERSECTION</p>
             </div>
        )}

        {foundStations.length === targetStations.length && targetStations.length > 0 && (
            <div className="bg-black text-white dark:bg-white dark:text-black p-12 text-center border-4 border-black dark:border-white animate-pulse">
                <h4 className="text-5xl font-black uppercase tracking-tighter mb-4">OPÉRATION RÉUSSIE</h4>
                <p className="text-xs font-bold uppercase tracking-[0.3em] mb-8">Base de données complète</p>
                <button 
                  onClick={shuffleAll}
                  className="bg-white text-black dark:bg-black dark:text-white px-10 py-3 font-black uppercase text-xs border-2 border-black dark:border-white hover:invert transition-all"
                >
                  Réinitialiser
                </button>
            </div>
        )}
      </section>
    </div>
  );
}
