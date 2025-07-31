'use client';

import React, { useState, useCallback } from 'react';
import { MetroStation } from '@/types/metro';
import { normalizeStationName, getLineColor } from '@/utils/metroUtils';
import { Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';

interface QuizTableProps {
  stations: MetroStation[];
  filteredStations: MetroStation[];
  guessedStations: string[];
  showAllAnswers?: boolean;
  gameEnded?: boolean;
  showConnections?: boolean;
  isAuthenticated?: boolean;
}

const QuizTable: React.FC<QuizTableProps> = ({ 
  stations, 
  filteredStations, 
  guessedStations,
  showAllAnswers = false,
  gameEnded = false,
  showConnections = true,
  isAuthenticated = false
}) => {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set());
  const [showGlobalAnswers, setShowGlobalAnswers] = useState(false);
  const [collapsedLines, setCollapsedLines] = useState<Set<string>>(new Set());

  const toggleLineVisibility = (lineName: string) => {
    setVisibleLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineName)) {
        newSet.delete(lineName);
      } else {
        newSet.add(lineName);
      }
      return newSet;
    });
  };

  const toggleGlobalVisibility = () => {
    setShowGlobalAnswers(prev => !prev);
  };

  const toggleLineCollapse = (lineName: string) => {
    setCollapsedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineName)) {
        newSet.delete(lineName);
      } else {
        newSet.add(lineName);
      }
      return newSet;
    });
  };

  const isStationGuessed = useCallback((station: MetroStation): boolean => {
    return guessedStations.includes(normalizeStationName(station.nom_long));
  }, [guessedStations]);

  const getStationConnections = (station: MetroStation): string => {
    if (station.connections.length === 0) return '-';
    
    // Format connections properly
    const formattedConnections = station.connections.map(conn => {
      // Check if this connection is a tram line (pure number means it's likely a tram)
      if (/^[0-9]+$/.test(conn)) {
        // Check if this is a tram connection by looking at the full stations list
        const isTramConnection = stations.some(s => 
          s.line === conn && s.mode === 'TRAMWAY'
        );
        if (isTramConnection) {
          return `T${conn}`;
        }
        return conn; // Metro lines stay as numbers
      }
      return conn; // RER A, Train H, etc. stay as is
    });
    
    return formattedConnections.join(', ');
  };

  // Group stations by line with memoization for performance
  const stationsByLine = React.useMemo(() => {
    const lineMap = new Map<string, MetroStation[]>();
    
    // Simply group stations by their line - each station should only appear once per line
    filteredStations.forEach(station => {
      const lineName = `${station.mode} ${station.line}`;
      if (!lineMap.has(lineName)) {
        lineMap.set(lineName, []);
      }
      lineMap.get(lineName)!.push(station);
    });

    // Sort stations within each line by order or geographic position
    lineMap.forEach((stationList) => {
      if (stationList.length > 1) {
        // Check if stations have order field (from line data files)
        const hasOrderField = stationList.some(s => s.order !== undefined);
        
        if (hasOrderField) {
          // Use manual ordering from line data files
          stationList.sort((a, b) => (a.order || 0) - (b.order || 0));
        } else {
          // Fallback to geographic ordering for CSV data
          const coords = stationList
            .map(s => s.coordinates)
            .filter(c => c !== undefined) as Array<{lat: number, lng: number}>;
          
          if (coords.length > 1) {
            const lngSpread = Math.max(...coords.map(c => c.lng)) - Math.min(...coords.map(c => c.lng));
            const latSpread = Math.max(...coords.map(c => c.lat)) - Math.min(...coords.map(c => c.lat));
            
            if (lngSpread > latSpread) {
              // East-west line, sort by longitude (x-axis)
              stationList.sort((a, b) => {
                if (!a.coordinates || !b.coordinates) return a.nom_long.localeCompare(b.nom_long);
                return a.coordinates.lng - b.coordinates.lng;
              });
            } else {
              // North-south line, sort by latitude (y-axis) 
              stationList.sort((a, b) => {
                if (!a.coordinates || !b.coordinates) return a.nom_long.localeCompare(b.nom_long);
                return b.coordinates.lat - a.coordinates.lat; // North to south
              });
            }
          } else {
            // Fallback to alphabetical if no coordinates
            stationList.sort((a, b) => a.nom_long.localeCompare(b.nom_long));
          }
        }
      }
    });

    return lineMap;
  }, [filteredStations]);

  // Auto-collapse completed lines
  React.useEffect(() => {
    const completedLines = new Set<string>();
    stationsByLine.forEach((lineStations, lineName) => {
      const guessedStationsInLine = lineStations.filter(station => isStationGuessed(station)).length;
      const totalStationsInLine = lineStations.length;
      const isLineCompleted = guessedStationsInLine === totalStationsInLine && totalStationsInLine > 0;
      
      if (isLineCompleted) {
        completedLines.add(lineName);
      }
    });
    
    setCollapsedLines(prev => {
      const newSet = new Set(prev);
      completedLines.forEach(line => newSet.add(line));
      return newSet;
    });
  }, [stationsByLine, guessedStations, isStationGuessed]);

  // Convert to array and sort lines for consistent display
  const sortedLines = React.useMemo(() => {
    return Array.from(stationsByLine.entries()).sort(([a], [b]) => {
      // Custom sorting function for transport lines
      const parseLineName = (lineName: string) => {
        const parts = lineName.split(' ');
        const mode = parts[0]; // METRO, TRAMWAY, RER, etc.
        const line = parts[1]; // 1, 2, T3A, A, etc.
        
        // Extract numeric part for sorting
        let numPart = 0;
        let letterPart = '';
        
        if (line.startsWith('T')) {
          // Tram lines: T1, T2, T3A, etc.
          const lineNum = line.substring(1);
          const match = lineNum.match(/^(\d+)(.*)$/);
          if (match) {
            numPart = parseInt(match[1]);
            letterPart = match[2];
          }
        } else if (/^\d+/.test(line)) {
          // Metro lines: 1, 2, 3bis, etc.
          const match = line.match(/^(\d+)(.*)$/);
          if (match) {
            numPart = parseInt(match[1]);
            letterPart = match[2];
          }
        } else {
          // RER/Train lines: A, B, C, etc.
          letterPart = line;
        }
        
        return { mode, numPart, letterPart, originalLine: line };
      };
      
      const aData = parseLineName(a);
      const bData = parseLineName(b);
      
      // First sort by mode
      const modeOrder = ['METRO', 'TRAMWAY', 'RER', 'TRANSILIEN'];
      const aModeIndex = modeOrder.indexOf(aData.mode);
      const bModeIndex = modeOrder.indexOf(bData.mode);
      
      if (aModeIndex !== bModeIndex) {
        return aModeIndex - bModeIndex;
      }
      
      // Then sort by number, then by letter part
      if (aData.numPart !== bData.numPart) {
        return aData.numPart - bData.numPart;
      }
      
      return aData.letterPart.localeCompare(bData.letterPart);
    });
  }, [stationsByLine]);

  // Calculate how many columns we want (responsive)
  const numberOfColumns = Math.min(4, Math.max(2, sortedLines.length));
  const linesPerColumn = Math.ceil(sortedLines.length / numberOfColumns);

  // Split lines into columns
  const columns = React.useMemo(() => {
    const cols: Array<Array<[string, MetroStation[]]>> = [];
    for (let i = 0; i < numberOfColumns; i++) {
      const start = i * linesPerColumn;
      const end = start + linesPerColumn;
      cols.push(sortedLines.slice(start, end));
    }
    return cols;
  }, [sortedLines, numberOfColumns, linesPerColumn]);

  return (
    <div>
      {/* Global Controls */}
      {!isAuthenticated && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={toggleGlobalVisibility}
            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            title={showGlobalAnswers ? "Hide all answers" : "Show all answers"}
          >
            {showGlobalAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
            {showGlobalAnswers ? 'Hide All' : 'Peek All'}
          </button>
        </div>
      )}

      {/* Lines Grid */}
      <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${numberOfColumns > 2 ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-2'}`}>
        {columns.map((columnLines, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {columnLines.map(([lineName, lineStations]) => {
              const isLineVisible = visibleLines.has(lineName);
              const shouldShowAnswers = showAllAnswers || gameEnded || showGlobalAnswers || isLineVisible;
              
              // Calculate guessed stations for this line
              const guessedStationsInLine = lineStations.filter(station => isStationGuessed(station)).length;
              const totalStationsInLine = lineStations.length;
              
              // Check if all stations in this line are guessed
              const isLineCompleted = guessedStationsInLine === totalStationsInLine;
              
              // Check if line is collapsed
              const isCollapsed = collapsedLines.has(lineName);
              
              return (
                <div key={lineName} className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${isLineCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                  {/* Line color indicator */}
                  <div 
                    className="h-1 w-full" 
                    style={{ backgroundColor: getLineColor(lineName) }}
                  ></div>
                  <div className={`px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${isLineCompleted ? 'bg-green-100 dark:bg-green-800/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLineCollapse(lineName)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title={isCollapsed ? "Expand line" : "Collapse line"}
                      >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <h4 className={`font-medium text-sm ${isLineCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-gray-100'}`}>
                        {lineName}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${isLineCompleted ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {guessedStationsInLine} / {totalStationsInLine}
                      </span>
                    </div>
                    {!isAuthenticated && (
                      <button
                        onClick={() => toggleLineVisibility(lineName)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title={isLineVisible ? "Hide answers for this line" : "Show answers for this line"}
                      >
                        {isLineVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {!isCollapsed && (
                    <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Station
                        </th>
                        {showConnections && (
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Connections
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {lineStations.map((station: MetroStation, index: number) => {
                        const isGuessed = isStationGuessed(station);
                        const showStationName = isGuessed || shouldShowAnswers;
                        
                        let stationRowClass = '';
                        if (gameEnded && !isGuessed) {
                          stationRowClass = 'bg-red-50 dark:bg-red-900/20';
                        } else if (isGuessed) {
                          stationRowClass = 'bg-green-50 dark:bg-green-900/20';
                        }
                        
                        return (
                          <tr key={`${station.id}-${lineName}-${index}`} className={stationRowClass}>
                            <td className="px-3 py-2 text-sm">
                              {showStationName ? (
                                <span className={
                                  isGuessed 
                                    ? "text-green-700 dark:text-green-300 font-medium"
                                    : gameEnded 
                                    ? "text-red-700 dark:text-red-300 font-medium"
                                    : "text-blue-700 dark:text-blue-300 font-medium"
                                }>
                                  {station.nom_long}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600 select-none">
                                  ●●●●●
                                </span>
                              )}
                            </td>
                            {showConnections && (
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                {getStationConnections(station)}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizTable;
