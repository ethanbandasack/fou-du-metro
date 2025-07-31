'use client';

import { MetroLine } from '@/types/metro';

interface LineFilterProps {
  lines: MetroLine[];
  selectedLines: string[];
  selectedModes: string[];
  onSelectionChange: (selectedLines: string[]) => void;
  onModeChange: (selectedModes: string[]) => void;
  className?: string;
}

export function LineFilter({ 
  lines, 
  selectedLines, 
  selectedModes, 
  onSelectionChange,
  onModeChange, 
  className = '' 
}: LineFilterProps) {
  const toggleLine = (lineNumber: string) => {
    const newSelection = selectedLines.includes(lineNumber)
      ? selectedLines.filter(line => line !== lineNumber)
      : [...selectedLines, lineNumber];
    
    onSelectionChange(newSelection);
  };

  const toggleMode = (mode: string) => {
    const newSelection = selectedModes.includes(mode)
      ? selectedModes.filter(m => m !== mode)
      : [...selectedModes, mode];
    
    onModeChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange(lines.map(line => line.line));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const availableModes = [...new Set(lines.map(line => line.mode))];

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Filter Transport</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            All
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            None
          </button>
        </div>
      </div>

      {/* Mode Filter */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Transport Type:</h4>
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
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Line Filter */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Lines:</h4>
        <div className="flex flex-wrap gap-2">
          {lines
            .filter(line => selectedModes.length === 0 || selectedModes.includes(line.mode))
            .map((line) => {
              const isSelected = selectedLines.includes(line.line);
              
              return (
                <button
                  key={`${line.mode}-${line.line}`}
                  onClick={() => toggleLine(line.line)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: line.color }}
                  >
                    {line.line}
                  </div>
                  <span className="font-medium">
                    {line.mode} {line.line}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({line.stations.length})
                  </span>
                </button>
              );
            })}
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {selectedLines.length === 0 
          ? 'No lines selected' 
          : `${selectedLines.length} line${selectedLines.length === 1 ? '' : 's'} selected`
        }
      </div>
    </div>
  );
}
