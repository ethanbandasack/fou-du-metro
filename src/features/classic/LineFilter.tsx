'use client';

import { LineBadge } from '@/components/LineBadge';
import { MODE_LABELS, MODES } from '@/domain/lines';
import type { Line } from '@/domain/network';

interface LineFilterProps {
  lines: Line[];
  selectedLines: string[];
  selectedModes: string[];
  onSelectionChange: (selectedLines: string[]) => void;
  onModeChange: (selectedModes: string[]) => void;
}

const toggled = (list: string[], item: string) =>
  list.includes(item) ? list.filter(x => x !== item) : [...list, item];

const chip = (selected: boolean) =>
  `flex items-center gap-2 px-3 py-1.5 border-2 transition-all text-xs font-bold ${
    selected ? 'border-blue-500 bg-blue-500/20 text-blue-600 dark:text-blue-300' : 'border-border bg-card text-foreground/70 hover:border-accent'
  }`;

const smallButton = 'px-2 py-0.5 border border-border bg-muted text-foreground/70 text-[10px] font-bold hover:bg-accent hover:text-accent-foreground transition-all';

export function LineFilter({ lines, selectedLines, selectedModes, onSelectionChange, onModeChange }: LineFilterProps) {
  const availableModes = MODES.filter(mode => lines.some(line => line.mode === mode));
  const visibleLines = lines.filter(line => selectedModes.length === 0 || selectedModes.includes(line.mode));

  return (
    <div className="p-4 bg-card shadow-md border-2 border-border space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Réseau à deviner</h3>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-foreground/70">Modes de transport</h4>
          <div className="flex gap-1">
            <button onClick={() => onModeChange([...availableModes])} className={smallButton}>Tous</button>
            <button onClick={() => onModeChange([])} className={smallButton}>Aucun</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableModes.map(mode => (
            <button key={mode} onClick={() => onModeChange(toggled(selectedModes, mode))} className={chip(selectedModes.includes(mode))}>
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-foreground/70">Lignes</h4>
          <div className="flex gap-1">
            <button onClick={() => onSelectionChange(visibleLines.map(line => line.id))} className={smallButton}>Toutes</button>
            <button onClick={() => onSelectionChange([])} className={smallButton}>Aucune</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleLines.map(line => (
            <button key={line.id} onClick={() => onSelectionChange(toggled(selectedLines, line.id))} className={chip(selectedLines.includes(line.id))}>
              <LineBadge id={line.id} />
              <span className="font-medium">{line.label}</span>
              <span className="text-[10px] opacity-40">({line.stops.length})</span>
            </button>
          ))}
        </div>
      </section>

      <p className="text-sm text-foreground/50 font-medium">
        {selectedLines.length === 0
          ? 'Aucune ligne sélectionnée : toutes les lignes des modes choisis sont jouées.'
          : `${selectedLines.length} ligne${selectedLines.length > 1 ? 's' : ''} sélectionnée${selectedLines.length > 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
