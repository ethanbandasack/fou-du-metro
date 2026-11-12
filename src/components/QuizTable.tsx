'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import type { Line } from '@/domain/network';

interface QuizTableProps {
  lines: Line[];
  guessedStations: string[];
  showAllAnswers?: boolean;
  gameEnded?: boolean;
  showConnections?: boolean;
  isAuthenticated?: boolean;
}

function toggle(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

const QuizTable: React.FC<QuizTableProps> = ({
  lines,
  guessedStations,
  showAllAnswers = false,
  gameEnded = false,
  showConnections = true,
  isAuthenticated = false
}) => {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set());
  const [collapsedLines, setCollapsedLines] = useState<Set<string>>(new Set());
  const guessed = useMemo(() => new Set(guessedStations), [guessedStations]);

  const guessedCount = (line: Line) => line.stops.filter(stop => guessed.has(stop.key)).length;

  // Auto-collapse completed lines
  useEffect(() => {
    const completed = lines.filter(line => line.stops.length > 0 && line.stops.every(stop => guessed.has(stop.key)));
    if (completed.length === 0) return;
    setCollapsedLines(prev => new Set([...prev, ...completed.map(line => line.id)]));
  }, [lines, guessed]);

  // Split lines into 2 to 4 columns
  const numberOfColumns = Math.min(4, Math.max(2, lines.length));
  const linesPerColumn = Math.ceil(lines.length / numberOfColumns);
  const columns = Array.from({ length: numberOfColumns }, (_, i) =>
    lines.slice(i * linesPerColumn, (i + 1) * linesPerColumn)
  );

  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${numberOfColumns > 2 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-2'}`}>
      {columns.map((columnLines, columnIndex) => (
        <div key={columnIndex} className="space-y-4">
          {columnLines.map(line => {
            const isLineVisible = visibleLines.has(line.id);
            const shouldShowAnswers = showAllAnswers || gameEnded || isLineVisible;
            const found = guessedCount(line);
            const isLineCompleted = found === line.stops.length;
            const isCollapsed = collapsedLines.has(line.id);

            return (
              <div key={line.id} className={`border border-border rounded-lg ${isLineCompleted ? 'bg-green-500/10' : ''}`}>
                <div
                  className={`sticky z-30 rounded-t-lg pt-2 ${isLineCompleted ? 'bg-green-500/20' : 'bg-muted'}`}
                  style={{ top: 'calc(var(--quiz-header-top, 80px) + var(--quiz-header-height, 100px) + 8px)' }}
                >
                  <div className="h-1 w-full" style={{ backgroundColor: line.colors.background }} />
                  <div className={`px-3 py-2 border-b border-border flex justify-between items-center ${isLineCompleted ? 'bg-green-500/10' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCollapsedLines(prev => toggle(prev, line.id))}
                        className="text-foreground/60 hover:text-foreground transition-colors"
                        title={isCollapsed ? "Développer la ligne" : "Réduire la ligne"}
                      >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <h4 className={`font-medium text-sm ${isLineCompleted ? 'text-green-600' : 'text-foreground'}`}>
                        {line.label}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${isLineCompleted ? 'bg-green-500/20 text-green-600' : 'bg-muted text-foreground/60'}`}>
                        {found} / {line.stops.length}
                      </span>
                    </div>
                    {!isAuthenticated && (
                      <button
                        onClick={() => setVisibleLines(prev => toggle(prev, line.id))}
                        className="text-foreground/60 hover:text-foreground transition-colors"
                        title={isLineVisible ? "Masquer les réponses" : "Afficher les réponses"}
                      >
                        {isLineVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="rounded-b-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-3 py-2 text-left text-xs font-medium text-foreground/60 tracking-wider">Gare</th>
                          {showConnections && (
                            <th className="px-3 py-2 text-left text-xs font-medium text-foreground/60 tracking-wider">Correspondances</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {line.stops.map(stop => {
                          const isGuessed = guessed.has(stop.key);
                          const rowClass = gameEnded && !isGuessed ? 'bg-red-500/10' : isGuessed ? 'bg-green-500/10' : '';
                          const nameClass = isGuessed ? 'text-green-600' : gameEnded ? 'text-red-600' : 'text-blue-600';
                          return (
                            <tr key={`${stop.id}-${stop.order}`} className={rowClass}>
                              <td className="px-3 py-2 text-sm">
                                {isGuessed || shouldShowAnswers ? (
                                  <span className={`${nameClass} font-medium font-parisine`}>{stop.name}</span>
                                ) : (
                                  <span className="text-foreground/30 select-none">●●●●●</span>
                                )}
                              </td>
                              {showConnections && (
                                <td className="px-3 py-2 text-sm text-foreground/60">
                                  {stop.connections.length > 0 ? stop.connections.join(', ') : '-'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default QuizTable;
