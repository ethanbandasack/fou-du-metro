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
        const modeOrder = ['METRO', 'RER', 'TRAIN', 'TRAMWAY', 'VAL'];
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
        const modeOrder = ['METRO', 'RER', 'TRAIN', 'TRAMWAY', 'VAL'];
        return modeOrder.indexOf(modeA) - modeOrder.indexOf(modeB);
      }
      return lineA.localeCompare(lineB);
    });
  }, [filteredStations]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Paris Transport Stations
        </h1>
        <p className="text-gray-600">
          Complete list of all metro, RER, train, and tram stations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mode Filter */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Transport Type:</h4>
          <div className="flex flex-wrap gap-2">
            {availableModes.map((mode) => {
              const isSelected = selectedModes.includes(mode);
              
              return (
                <button
                  key={mode}
                  onClick={() => toggleMode(mode)}
                  className={`
                    px-3 py-1 rounded-md border-2 transition-all text-sm
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-800' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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
            <h4 className="font-medium text-sm text-gray-700 mb-2">Lines:</h4>
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
                        flex items-center gap-2 px-2 py-1 rounded-md border-2 transition-all text-sm
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-800' 
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: line.color }}
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
      <div className="text-center text-gray-600">
        Showing {filteredStations.length} stations
      </div>

      {/* Stations Table - Grouped by Line */}
      <div className="space-y-6">
        {groupedByLine.map(([lineKey, stationsInLine]) => {
          const [mode, line] = lineKey.split(' ');
          const lineInfo = lines.find(l => l.mode === mode && l.line === line);
          
          return (
            <div key={lineKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="px-6 py-4 text-white font-semibold text-lg flex items-center gap-3"
                style={{ backgroundColor: lineInfo?.color || '#666666' }}
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                  {line}
                </div>
                {mode} Line {line}
                <span className="ml-auto text-sm opacity-90">
                  {stationsInLine.length} stations
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Station Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Connections
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operator
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stationsInLine.map((station) => (
                      <tr key={station.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {station.nom_long}
                            </div>
                            {station.nom_so_gar && (
                              <div className="text-sm text-gray-500">
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
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {connection}
                              </span>
                            ))}
                            {station.connections.length === 0 && (
                              <span className="text-gray-400 text-sm">No connections</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Stations Found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
