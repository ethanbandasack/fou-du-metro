'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Shuffle } from 'lucide-react';
import { LineBadge } from '@/components/LineBadge';
import { isMetroLine } from '@/domain/lines';
import { buildAnswerIndex, findMentionedAnswers, lookupAnswer } from '@/domain/matching';
import type { Station } from '@/domain/network';
import {
  buildCategories,
  CATEGORY_GROUPS,
  categoryFilter,
  findTargets,
  suggestStations,
  type Category,
  type CategoryGroup,
} from '@/features/intersection/categories';
import { useVoice } from '@/features/voice/useVoice';
import { VoiceButton, VoiceStatus } from '@/features/voice/VoiceControls';

interface Pick {
  group: CategoryGroup;
  categoryId: string;
  custom: string;
}

const GROUP_IDS = Object.keys(CATEGORY_GROUPS) as CategoryGroup[];
const DISPLAYED_LINE = /^(\d+(BIS)?|[A-E]|T\d+[AB]?|C1)$/i;

const randomItem = <T,>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)];

const sideButton =
  'w-full bg-card text-foreground py-2 text-[10px] font-black tracking-[0.2em] border border-border hover:bg-accent hover:text-accent-foreground transition-all';

export function IntersectionQuiz({ allStations }: { allStations: Station[] }) {
  const stations = useMemo(() => allStations.filter(s => s.lines.some(isMetroLine)), [allStations]);
  const categories = useMemo(() => buildCategories(stations), [stations]);
  const answerIndex = useMemo(() => buildAnswerIndex(stations.map(s => ({ key: s.name, names: s.aliases }))), [stations]);

  const randomPick = (group: CategoryGroup): Pick => {
    const playable = categories[group].filter(c => !c.custom);
    return { group, categoryId: (randomItem(playable) ?? categories[group][0]).id, custom: '' };
  };

  const [twoCategories, setTwoCategories] = useState(true);
  // Random start: this component only renders after a click, never on the server.
  const [picks, setPicks] = useState<[Pick, Pick]>(() => [randomPick('line'), randomPick('geo')]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
  const [found, setFound] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [round, setRound] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const findCategory = (pick: Pick) => categories[pick.group].find(c => c.id === pick.categoryId);
  const activePicks = twoCategories ? picks : [picks[0]];

  const targets = useMemo(() => {
    const filters = activePicks.map(pick => {
      const category = findCategory(pick);
      return category ? categoryFilter(category, pick.custom) : () => false;
    });
    return findTargets(stations, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, categories, twoCategories, picks]);

  // New question or explicit restart: clear progress
  const [question, setQuestion] = useState({ targets, round });
  if (question.targets !== targets || question.round !== round) {
    setQuestion({ targets, round });
    setFound([]);
    setRevealed(false);
    setInput('');
  }

  const suggestions = useMemo(
    () => (suggestionsEnabled ? suggestStations(stations, input) : []),
    [stations, input, suggestionsEnabled]
  );

  const updatePick = (index: 0 | 1, pick: Pick) =>
    setPicks(prev => (index === 0 ? [pick, prev[1]] : [prev[0], pick]));

  const shuffleAll = () =>
    setPicks([randomPick(randomItem(GROUP_IDS)!), randomPick(randomItem(GROUP_IDS)!)]);

  const shake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const guess = (text: string) => {
    const newTarget = lookupAnswer(answerIndex, text).find(name => targets.includes(name) && !found.includes(name));
    if (newTarget) {
      setFound(prev => [...prev, newTarget]);
      setInput('');
    } else {
      shake();
    }
    inputRef.current?.focus();
  };

  // Voice: every target named in what the player says is found.
  const voice = useVoice((transcript, isFinal) => {
    const named = findMentionedAnswers(answerIndex, transcript).filter(name => targets.includes(name));
    const fresh = named.filter(name => !found.includes(name));
    if (fresh.length > 0) setFound(prev => [...new Set([...prev, ...fresh])]);
    else if (isFinal && named.length === 0) shake();
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (input.trim()) guess(input);
  };

  const [catA, catB] = picks.map(findCategory);
  const isEmpty = targets.length === 0;
  const stopVoice = voice.stop;
  useEffect(() => {
    if (revealed || isEmpty) stopVoice();
  }, [revealed, isEmpty, stopVoice]);

  return (
    <div className="flex flex-col md:flex-row bg-card text-foreground transition-colors duration-300 shadow-sm overflow-hidden">
      <aside className="order-2 md:order-1 w-full md:w-[300px] bg-muted border-t md:border-t-0 md:border-r border-border p-5 sm:p-8 space-y-6 sm:space-y-10 shrink-0 flex flex-col transition-colors duration-300">
        <header className="border-b border-border pb-4">
          <h1 className="text-xl font-bold tracking-tight">Intersection</h1>
          <span className="text-[11px] text-foreground/50 font-medium">Entraînement / Intersection</span>
        </header>

        <div className="flex border border-border overflow-hidden">
          {[true, false].map(two => (
            <button
              key={String(two)}
              onClick={() => setTwoCategories(two)}
              className={`flex-1 py-2 text-[11px] font-bold transition-all ${twoCategories === two ? 'bg-accent text-accent-foreground' : 'bg-card hover:bg-muted'}`}
            >
              {two ? '2 catégories' : '1 catégorie'}
            </button>
          ))}
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-4">
            <CategoryPicker
              label="Catégorie 1"
              pick={picks[0]}
              categories={categories}
              onChange={pick => updatePick(0, pick)}
              onRandom={() => updatePick(0, randomPick(picks[0].group))}
              onGroupChange={group => updatePick(0, randomPick(group))}
            />
            {twoCategories && (
              <CategoryPicker
                label="Catégorie 2"
                pick={picks[1]}
                categories={categories}
                onChange={pick => updatePick(1, pick)}
                onRandom={() => updatePick(1, randomPick(picks[1].group))}
                onGroupChange={group => updatePick(1, randomPick(group))}
              />
            )}
          </div>

          <div className="space-y-3 pt-4">
            <button onClick={shuffleAll} className={sideButton}>Tout mélanger</button>
            <button onClick={() => setRound(r => r + 1)} className={sideButton}>Recommencer</button>
          </div>

          <div className="pt-6 border-t border-border flex items-center gap-3">
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

      <main className="order-1 md:order-2 flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 bg-card/80 backdrop-blur-md z-30 px-5 sm:px-8 lg:px-12 py-4 lg:py-6 border-b border-border flex flex-col md:flex-row justify-between items-baseline gap-4 mb-6 transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryChip category={catA} />
            {twoCategories && (
              <>
                <span className="text-xl font-light">/</span>
                <CategoryChip category={catB} />
              </>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold tracking-tight">{found.length} / {targets.length}</div>
            <div className="text-[10px] text-foreground/40 font-bold tracking-widest">Progression</div>
          </div>
        </header>

        <div className="px-5 sm:px-8 lg:px-12 pt-0 pb-8 space-y-10">
          <section className="space-y-2 relative">
            <form onSubmit={submit} className="flex gap-2 items-end">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setInput('')}
                placeholder="Saisir une station..."
                disabled={revealed || isEmpty}
                autoComplete="off"
                spellCheck={false}
                className={`flex-1 min-w-0 w-full bg-transparent border-b-2 border-border py-2 text-2xl sm:text-3xl font-bold tracking-tight outline-none placeholder:text-foreground/20 transition-all font-parisine ${isEmpty ? 'opacity-20 cursor-not-allowed' : ''} ${errorShake ? 'animate-shake border-red-500' : ''}`}
              />
              <VoiceButton
                supported={voice.supported}
                disabled={revealed || isEmpty}
                listening={voice.listening}
                onToggle={voice.toggle}
                className="h-12"
              />
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
                  <span className="text-red-500 text-xs font-black tracking-widest bg-card pr-4">
                    Attention : aucune station trouvée avec ces critères
                  </span>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-card border border-border mt-1">
                  {suggestions.map(s => (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => guess(s.name)}
                      className="w-full text-left p-4 border-b border-border hover:bg-muted font-bold text-sm"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </form>
            <VoiceStatus listening={voice.listening} transcript={voice.transcript} error={voice.error} />
            <div className="flex justify-between items-center text-[10px] font-medium text-foreground/40">
              <span>Entrée pour valider · Alt+V pour dicter</span>
              <button onClick={() => setRevealed(true)} className="hover:text-foreground">Afficher les réponses</button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[11px] font-bold tracking-widest text-foreground/40">Stations à trouver</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-px bg-border border border-border">
              {(revealed ? targets : targets.filter(name => found.includes(name))).map(name => {
                const isFound = found.includes(name);
                const station = stations.find(s => s.name === name);
                return (
                  <div key={name} className={`bg-card p-5 flex flex-col justify-between h-32 font-parisine ${isFound ? '' : 'opacity-70 contrast-[0.8] italic'}`}>
                    <div>
                      <span className="text-[11px] font-bold leading-tight block">{name}</span>
                      {station && station.aliases.length > 1 && (
                        <span className="text-[8px] text-foreground/40 block mt-0.5">
                          {station.aliases.filter(a => a !== name).join(' / ')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {station?.lines.filter(l => DISPLAYED_LINE.test(l)).map(l => <LineBadge key={l} id={l} />)}
                    </div>
                  </div>
                );
              })}
              {!revealed && Array.from({ length: targets.length - found.length }, (_, i) => (
                <div key={`remaining-${i}`} className="bg-card p-5 h-32 flex items-center justify-center text-foreground/20 select-none" aria-hidden>
                  ●●●●●
                </div>
              ))}
            </div>

            {isEmpty && (
              <div className="py-32 text-center border-2 border-dashed border-red-500/20 bg-red-500/5">
                <p className="text-red-600 font-black text-xs tracking-[0.2em]">Intersection vide</p>
                <p className="text-[10px] text-red-400 mt-2 font-medium">Veuillez modifier vos critères de recherche dans la barre latérale</p>
              </div>
            )}
          </section>

          {!isEmpty && found.length === targets.length && (
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

interface CategoryPickerProps {
  label: string;
  pick: Pick;
  categories: Record<CategoryGroup, Category[]>;
  onChange: (pick: Pick) => void;
  onRandom: () => void;
  onGroupChange: (group: CategoryGroup) => void;
}

const selectClass = 'bg-card border border-border p-2 text-xs font-medium focus:outline-none appearance-none text-foreground truncate';

function CategoryPicker({ label, pick, categories, onChange, onRandom, onGroupChange }: CategoryPickerProps) {
  const category = categories[pick.group].find(c => c.id === pick.categoryId);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-foreground/40 tracking-wider">{label}</label>
      <select value={pick.group} onChange={(e) => onGroupChange(e.target.value as CategoryGroup)} className={`w-full ${selectClass}`}>
        {GROUP_IDS.map(id => <option key={id} value={id}>{CATEGORY_GROUPS[id]}</option>)}
      </select>
      <div className="flex gap-2 min-w-0">
        <select value={pick.categoryId} onChange={(e) => onChange({ ...pick, categoryId: e.target.value })} className={`flex-1 ${selectClass}`}>
          {categories[pick.group].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={onRandom} title="Catégorie au hasard" className="border border-border aspect-square w-9 flex items-center justify-center bg-card hover:bg-accent hover:text-accent-foreground transition-all">
          <Shuffle size={14} />
        </button>
      </div>
      {category?.custom ? (
        <input
          type="text"
          value={pick.custom}
          onChange={(e) => onChange({ ...pick, custom: e.target.value })}
          placeholder={category.custom === 'arrondissements' ? 'Ex: 1, 2, 8, 15' : 'Ex: 1, 4, 14'}
          className="w-full bg-card border border-border p-2 text-xs font-medium focus:outline-none text-foreground placeholder:text-foreground/40"
        />
      ) : category?.items && pick.group === 'groups' ? (
        <div className="flex flex-wrap gap-1 mt-2 p-2 border border-border">
          {category.items.map(item => <LineBadge key={item} id={item} />)}
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({ category }: { category?: Category }) {
  return (
    <span
      className="px-3 py-1 border border-border font-bold text-sm"
      style={{ backgroundColor: category?.colors.background ?? 'var(--card)', color: category?.colors.text ?? 'var(--foreground)' }}
    >
      {category?.name}
    </span>
  );
}
