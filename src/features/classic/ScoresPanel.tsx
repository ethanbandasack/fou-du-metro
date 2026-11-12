'use client';

import { LogIn, Trash2, X } from 'lucide-react';
import { formatDuration } from '@/domain/format';
import type { QuizScore } from '@/features/classic/scores';

interface ScoresPanelProps {
  scores: QuizScore[];
  canEdit: boolean;
  onDelete: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ScoresPanel({ scores, canEdit, onDelete, onClear, onClose }: ScoresPanelProps) {
  return (
    <div className="bg-card p-6 shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-foreground">Scores récents</h3>
        <div className="flex gap-2">
          {scores.length > 0 && canEdit && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
            >
              <Trash2 size={16} />
              Effacer tout
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1 bg-muted text-foreground border border-border hover:opacity-80 transition-colors text-sm"
          >
            <X size={16} />
            Fermer
          </button>
        </div>
      </div>

      {!canEdit && (
        <div className="bg-blue-500/10 border border-blue-500/30 p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 text-sm">
            <LogIn size={16} />
            <span className="font-medium text-[10px] tracking-widest">Connectez-vous pour sauvegarder</span>
          </div>
          <p className="text-blue-600/80 dark:text-blue-300/80 text-[10px] mt-1 font-bold">
            Vous pouvez voir tous les scores, mais la connexion est requise pour sauvegarder vos propres résultats.
          </p>
        </div>
      )}

      {scores.length === 0 ? (
        <p className="text-foreground/40 text-center py-8 font-bold uppercase text-xs">
          Aucun score sauvegardé. Terminez un quiz pour voir les résultats ici !
        </p>
      ) : (
        <div className="space-y-3">
          {scores.map((score) => {
            const date = new Date(score.date);
            return (
              <div key={score.id} className="flex items-center justify-between p-3 bg-muted">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-1">
                    <span className="font-bold text-lg text-green-600">{score.percentage}%</span>
                    <span className="text-foreground font-medium">{score.score} / {score.totalStations} gares</span>
                    <span className="text-foreground/60 font-bold">{formatDuration(score.timeElapsed)}</span>
                    <span className="text-[10px] font-black uppercase text-accent-foreground bg-accent px-2 py-1">
                      {score.username}
                    </span>
                  </div>
                  <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">
                    {date.toLocaleDateString('fr-FR')} {date.toLocaleTimeString('fr-FR')} •{' '}
                    {score.modes.join(', ')} • {score.lines.length > 0 ? score.lines.join(', ') : 'Toutes les lignes'}
                  </div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onDelete(score.id)}
                    className="ml-3 p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer ce score"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
