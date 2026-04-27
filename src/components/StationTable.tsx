'use client';

import { MetroStation, MetroLine } from '@/types/metro';
import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';

interface StationTableProps {
  stations: MetroStation[];
  lines: MetroLine[];
}

export function StationTable({ stations, lines }: StationTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>(['METRO', 'RER']);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);

  const availableModes = [...new Set(lines.map(line => line.mode))];

  const filteredStations = useMemo(() => {
    let result = stations;

    // Filter by search term
    if (searchTerm.trim()) {
      result = result.filter(station =>
        station.nom_long.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.nom_so_gar?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by modes
    if (selectedModes.length > 0) {
      result = result.filter(station => selectedModes.includes(station.mode));
    }

    // Filter by lines
    if (selectedLines.length > 0) {
      result = result.filter(station => selectedLines.includes(station.line));
    }

    return result.sort((a, b) => {
      // Sort by mode first, then by line, then by name
      if (a.mode !== b.mode) {
        const modeOrder = ['METRO', 'RER', 'TRANSILIEN', 'TRAIN', 'TRAMWAY', 'VAL'];
        return modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode);
      }
      if (a.line !== b.line) {
        return a.line.localeCompare(b.line);
      }
      return a.nom_long.localeCompare(b.nom_long);
    });
  }, [stations, searchTerm, selectedModes, selectedLines]);

  const toggleMode = (mode: string) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const toggleLine = (line: string) => {
    setSelectedLines(prev =>
      prev.includes(line)
        ? prev.filter(l => l !== line)
        : [...prev, line]
    );
  };

  const groupedByLine = useMemo(() => {
    const groups = new Map<string, MetroStation[]>();
    
    filteredStations.forEach(station => {
      const key = `${station.mode} ${station.line}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(station);
    });
    
    return Array.from(groups.entries()).sort(([keyA], [keyB]) => {
      const [modeA, lineA] = keyA.split(' ');
      const [modeB, lineB] = keyB.split(' ');
      
      if (modeA !== modeB) {
        const modeOrder = ['METRO', 'RER', 'TRANSILIEN', 'TRAIN', 'TRAMWAY', 'VAL'];
        return modeOrder.indexOf(modeA) - modeOrder.indexOf(modeB);
      }
      return lineA.localeCompare(lineB);
    });
  }, [filteredStations]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-2">
          Gares & Stations
        </h1>
        <p className="text-foreground/60 font-bold uppercase text-[10px] tracking-widest">
          Liste complète du réseau (Métro, RER, Train, Tramway)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 border-2 border-border shadow-md space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Rechercher une gare..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border bg-card text-foreground focus:outline-none focus:bg-muted transition-colors font-bold"
          />
        </div>

        {/* Mode Filter */}
        <div>
          <h4 className="font-bold text-[10px] text-foreground/50 uppercase tracking-widest mb-2">Type de Transport :</h4>
          <div className="flex flex-wrap gap-2">
            {availableModes.map((mode) => {
              const isSelected = selectedModes.includes(mode);
              
              return (
                <button
                  key={mode}
                  onClick={() => toggleMode(mode)}
                  className={`
                    px-3 py-1 border-2 transition-all text-xs font-black uppercase
                    ${isSelected 
                      ? 'border-accent bg-accent text-accent-foreground' 
                      : 'border-border bg-card text-foreground/70 hover:border-accent'
                    }
                  `}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Lines for selected modes */}
        {selectedModes.length > 0 && (
          <div>
            <h4 className="font-bold text-[10px] text-foreground/50 uppercase tracking-widest mb-2">Lignes :</h4>
            <div className="flex flex-wrap gap-2">
              {lines
                .filter(line => selectedModes.includes(line.mode))
                .map((line) => {
                  const isSelected = selectedLines.includes(line.line);
                  
                  return (
                    <button
                      key={`${line.mode}-${line.line}`}
                      onClick={() => toggleLine(line.line)}
                      className={`
                        flex items-center gap-2 px-2 py-1 border-2 transition-all text-[10px] font-black uppercase
                        ${isSelected 
                          ? 'border-accent bg-accent text-accent-foreground' 
                          : 'border-border bg-card text-foreground/70 hover:border-accent'
                        }
                      `}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ backgroundColor: line.color, color: line.textColor }}
                      >
                        {line.line}
                      </div>
                      {line.mode} {line.line}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-foreground/40 font-bold uppercase text-[10px] tracking-[0.2em]">
        Affichage de {filteredStations.length} gares
      </div>

      {/* Stations Table - Grouped by Line */}
      <div className="space-y-6">
        {groupedByLine.map(([lineKey, stationsInLine]) => {
          const [mode, line] = lineKey.split(' ');
          const lineInfo = lines.find(l => l.mode === mode && l.line === line);
          
          return (
            <div key={lineKey} className="bg-card border-2 border-border shadow-md overflow-hidden transition-colors duration-300">
              <div 
                className="px-6 py-4 font-semibold text-lg flex items-center gap-3"
                style={{ backgroundColor: lineInfo?.color || '#666666', color: lineInfo?.textColor || '#FFFFFF' }}
              >
                <div className="w-8 h-8 bg-white/20 border-2 border-white/40 flex items-center justify-center font-black">
                  {line}
                </div>
                {mode} - Ligne {line}
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest opacity-80">
                  {stationsInLine.length} gares
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Nom de la Gare
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Correspondances
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Exploitant
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {stationsInLine.map((station) => (
                      <tr key={station.id} className="hover:bg-muted transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-black text-foreground font-parisine">
                              {station.nom_long}
                            </div>
                            {station.nom_so_gar && (
                              <div className="text-xs text-foreground/40 font-bold uppercase">
                                {station.nom_so_gar}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {station.connections.map((connection, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 border border-border text-[9px] font-black uppercase bg-muted text-foreground"
                              >
                                {connection}
                              </span>
                            ))}
                            {station.connections.length === 0 && (
                              <span className="text-foreground/30 text-xs font-bold italic uppercase">Aucune correspondance</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-foreground/60 uppercase">
                          {station.exploitant}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-black uppercase text-foreground mb-2">
            Aucune gare trouvée
          </h3>
          <p className="text-foreground/40 font-bold uppercase text-xs">
            Essayez d'ajuster votre recherche ou vos critères de filtrage.
          </p>
        </div>
      )}
    </div>
  );
}
