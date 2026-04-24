'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { EnrichedStation } from '@/types/metro';
import { 
  getAvailableCategories, 
  MetaCategories, 
  LINE_COLORS 
} from '@/utils/intersectionUtils';
import { 
  Shuffle
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
  const [customLines] = useState<string>('');
  const [customArrs] = useState<string>('');
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  
  const [targetStations, setTargetStations] = useState<string[]>([]);
  const [foundStations, setFoundStations] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [suggestions, setSuggestions] = useState<EnrichedStation[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => 
    getAvailableCategories(allStations, customLines, customArrs), 
    [allStations, customLines, customArrs]
  );

  const flatPool = useMemo(() => Object.values(categories).flat(), [categories]);

  // Handle random category selection
  const handleRandomSub = useCallback((index: 1 | 2) => {
    const meta = index === 1 ? meta1 : meta2;
    const cats = categories[meta] || [];
    const validCats = cats.filter(c => !c.id.startsWith('random-'));
    if (validCats.length > 0) {
      const randomCat = validCats[Math.floor(Math.random() * validCats.length)];
      if (index === 1) setSub1(randomCat.id);
      else setSub2(randomCat.id);
    }
  }, [meta1, meta2, categories]);

  const shuffleAll = () => {
    const metas = Object.keys(MetaCategories).filter(m => m !== 'custom');
    const m1 = metas[Math.floor(Math.random() * metas.length)];
    const m2 = metas[Math.floor(Math.random() * metas.length)];
    
    setMeta1(m1);
    setMeta2(m2);

    // Give react time to update categories pool if needed (though it shouldn't be strictly necessary since it's computed)
    const cat1List = getAvailableCategories(allStations, customLines, customArrs)[m1];
    const cat2List = getAvailableCategories(allStations, customLines, customArrs)[m2];

    if (cat1List.length > 0) {
        const r1 = cat1List[Math.floor(Math.random() * cat1List.length)];
        setSub1(r1.id);
    }
    if (cat2List.length > 0) {
        const r2 = cat2List[Math.floor(Math.random() * cat2List.length)];
        setSub2(r2.id);
    }
  };

  // Sync subcategories when meta changes
  useEffect(() => {
    if (!sub1 || !categories[meta1]?.find(c => c.id === sub1)) {
        handleRandomSub(1);
    }
  }, [meta1, categories, sub1, handleRandomSub]);

  useEffect(() => {
    if (!sub2 || !categories[meta2]?.find(c => c.id === sub2)) {
        handleRandomSub(2);
    }
  }, [meta2, categories, sub2, handleRandomSub]);

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
    setSuggestions([]);
  }, [allStations, flatPool, sub1, sub2, gameMode]);

  useEffect(() => {
    setupGame();
  }, [setupGame]);

  // Autocomplete logic
  useEffect(() => {
    if (!suggestionsEnabled || searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const val = normalizeStationName(searchInput);
    if (!val) {
      setSuggestions([]);
      return;
    }

    const filtered = allStations.filter(s => {
      const normalizedNom = normalizeStationName(s.nom);
      return normalizedNom.includes(val);
    }).slice(0, 8);
    
    setSuggestions(filtered);
  }, [searchInput, allStations, suggestionsEnabled]);

  const handleGuess = (e?: React.FormEvent, manualName?: string) => {
    if (e) e.preventDefault();
    const val = (manualName || searchInput).trim();
    if (!val) return;

    const matchedStation = allStations.find(s => 
      fuzzyMatch(val, s.nom)
    );

    if (matchedStation && targetStations.includes(matchedStation.nom)) {
      if (!foundStations.includes(matchedStation.nom)) {
        setFoundStations(prev => [...prev, matchedStation.nom]);
        setSearchInput('');
        setSuggestions([]);
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


  return (
    <div className="flex flex-col md:flex-row bg-card text-foreground transition-colors duration-300 shadow-sm overflow-hidden">
      {/* Sidebar - Config Minimaliste */}
      <aside className="w-full md:w-[300px] bg-muted border-r border-border p-8 space-y-10 shrink-0 flex flex-col transition-colors duration-300">
        <header className="border-b border-border pb-4">
            <h1 className="text-xl font-bold tracking-tight">Metrodoku</h1>
            <span className="text-[11px] text-gray-500 font-medium">Entraînement / Intersection</span>
        </header>

        <div className="flex border border-border overflow-hidden">
            <button 
              onClick={() => setGameMode('intersection')} 
              className={`flex-1 py-2 text-[11px] font-bold transition-all ${gameMode === 'intersection' ? 'bg-accent text-accent-foreground' : 'bg-card hover:bg-muted'}`}
            >
              2 catégories
            </button>
            <button 
              onClick={() => setGameMode('single')} 
              className={`flex-1 py-2 text-[11px] font-bold transition-all ${gameMode === 'single' ? 'bg-accent text-accent-foreground' : 'bg-card hover:bg-muted'}`}
            >
              1 catégorie
            </button>
        </div>

        <div className="space-y-8 flex-1">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider">Catégorie 1</label>
                    <select value={meta1} onChange={(e) => setMeta1(e.target.value)} className="w-full bg-card border border-border p-2 text-xs font-medium focus:outline-none appearance-none text-foreground">
                        {Object.entries(MetaCategories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <select value={sub1} onChange={(e) => setSub1(e.target.value)} disabled={meta1 === 'custom'} className="flex-1 bg-card border border-border p-2 text-xs font-medium focus:outline-none appearance-none text-foreground">
                            {categories[meta1]?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <button onClick={() => handleRandomSub(1)} className="border border-border aspect-square w-9 flex items-center justify-center bg-card hover:bg-accent hover:text-accent-foreground transition-all">
                            <Shuffle size={14} />
                        </button>
                    </div>
                </div>

                {gameMode === 'intersection' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 tracking-wider">Catégorie 2</label>
                        <select value={meta2} onChange={(e) => setMeta2(e.target.value)} className="w-full bg-card border border-border p-2 text-xs font-medium focus:outline-none appearance-none text-foreground">
                            {Object.entries(MetaCategories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <select value={sub2} onChange={(e) => setSub2(e.target.value)} disabled={meta2 === 'custom'} className="flex-1 bg-card border border-border p-2 text-xs font-medium focus:outline-none appearance-none text-foreground">
                                {categories[meta2]?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <button onClick={() => handleRandomSub(2)} className="border border-border aspect-square w-9 flex items-center justify-center bg-card hover:bg-accent hover:text-accent-foreground transition-all">
                                <Shuffle size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 pt-4">
                <button 
                    onClick={shuffleAll}
                    className="w-full bg-card text-foreground py-2 text-[10px] font-black tracking-[0.2em] border border-border hover:bg-accent hover:text-accent-foreground transition-all"
                >
                    Tout mélanger
                </button>
                <button 
                    onClick={setupGame}
                    className="w-full bg-card text-foreground py-2 text-[10px] font-black tracking-[0.2em] border border-border hover:bg-accent hover:text-accent-foreground transition-all"
                >
                    Recommencer
                </button>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <span className="text-[11px] font-bold">Suggestions</span>
                <button 
                  onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
                  className={`border border-border px-3 py-1 text-[10px] font-bold transition-all ${suggestionsEnabled ? 'bg-accent text-accent-foreground' : 'bg-card'}`}
                >
                  {suggestionsEnabled ? 'Oui' : 'Non'}
                </button>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-card/80 backdrop-blur-md z-30 px-8 lg:px-12 py-4 lg:py-6 border-b border-border flex flex-col md:flex-row justify-between items-baseline gap-4 mb-6 transition-colors duration-300">
            <div className="flex flex-wrap items-center gap-3">
                <span 
                    className="px-3 py-1 border border-border font-bold text-sm"
                    style={{ 
                        backgroundColor: currentCatA?.type === 'line' ? LINE_COLORS[currentCatA.id.replace('line-', '')] : 'var(--card)',
                        color: currentCatA?.type === 'line' ? 'white' : 'var(--foreground)'
                    }}
                >
                    {currentCatA?.name}
                </span>
                {gameMode === 'intersection' && (
                    <>
                        <span className="text-xl font-light">/</span>
                        <span 
                            className="px-3 py-1 border border-border font-bold text-sm"
                            style={{ 
                                backgroundColor: currentCatB?.type === 'line' ? LINE_COLORS[currentCatB.id.replace('line-', '')] : 'var(--card)',
                                color: currentCatB?.type === 'line' ? 'white' : 'var(--foreground)'
                            }}
                        >
                            {currentCatB?.name}
                        </span>
                    </>
                )}
            </div>

            <div className="text-right">
                <div className="text-4xl font-bold tracking-tight">
                    {foundStations.length} / {targetStations.length}
                </div>
                <div className="text-[10px] text-gray-400 font-bold tracking-widest">Progression</div>
            </div>
        </header>

        <div className="px-8 lg:px-12 pt-0 space-y-10">
            {/* Input area */}
            <section className="space-y-2 relative">
                <form onSubmit={handleGuess}>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Saisir une station..."
                        disabled={revealed || targetStations.length === 0}
                        className={`w-full bg-transparent border-b-2 border-border py-2 text-3xl font-bold tracking-tight outline-none placeholder:text-gray-400/30 transition-all font-parisine ${targetStations.length === 0 ? 'opacity-20 cursor-not-allowed' : ''} ${errorShake ? 'animate-shake border-red-500' : 'focus:border-border'}`}
                    />
                    
                    {targetStations.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
                            <span className="text-red-500 text-xs font-black tracking-widest bg-card pr-4">Attention : Aucune station trouvée avec ces critères</span>
                        </div>
                    )}
                    
                    {/* Suggestions List */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border mt-1">
                            {suggestions.map(s => (
                                <div 
                                    key={s.nom}
                                    onClick={() => handleGuess(undefined, s.nom)}
                                    className="p-4 border-b border-border hover:bg-muted cursor-pointer font-bold text-sm flex justify-between items-center"
                                >
                                    <span>{s.nom}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>
                <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
                    <span>Entrée pour valider</span>
                    <button onClick={revealAll} className="hover:text-foreground">Afficher les réponses</button>
                </div>
            </section>

            {/* Results */}
            <section className="space-y-6">
                <h3 className="text-[11px] font-bold tracking-widest text-gray-400">Stations trouvées</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-px bg-border border border-border">
                    {targetStations.map(name => {
                        const isFound = foundStations.includes(name);
                        const station = allStations.find(s => s.nom === name);
                        if (!isFound && !revealed) return null;

                        return (
                            <div key={name} className={`bg-card p-5 flex flex-col justify-between h-32 font-parisine ${isFound ? '' : 'opacity-70 contrast-[0.8] italic'}`}>
                                <span className="text-[11px] font-bold leading-tight">{name}</span>
                                <div className="flex flex-wrap gap-1">
                                    {station?.lines.map(l => (
                                        <div 
                                            key={l} 
                                            className="w-6 h-6 flex items-center justify-center text-[10px] font-bold border border-border font-parisine"
                                            style={{backgroundColor: (isFound || revealed) ? LINE_COLORS[l] : '#eee', color: (isFound || revealed) ? 'white' : '#999'}}
                                        >
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {targetStations.length === 0 && (
                    <div className="py-32 text-center border-2 border-dashed border-red-100 bg-red-50/30">
                        <p className="text-red-600 font-black text-xs tracking-[0.2em]">Intersection vide</p>
                        <p className="text-[10px] text-red-400 mt-2 font-medium">Veuillez modifier vos critères de recherche dans la barre latérale</p>
                    </div>
                )}
            </section>

            {foundStations.length === targetStations.length && targetStations.length > 0 && (
                <div className="bg-card text-foreground py-12 px-6 text-center border border-border">
                    <h4 className="text-3xl font-bold tracking-tight mb-2 font-parisine">Quiz terminé</h4>
                    <p className="text-[10px] font-black tracking-[0.3em] opacity-40">Toutes les stations ont été identifiées</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
