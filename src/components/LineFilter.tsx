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
    <div className={`p-4 bg-card rounded-lg shadow-md border-2 border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">Filter Transport</h3>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1 bg-accent text-accent-foreground border-2 border-border rounded text-sm hover:opacity-80 transition-colors"
          >
            All
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-muted text-foreground border-2 border-border rounded text-sm hover:opacity-80 transition-colors"
          >
            None
          </button>
        </div>
      </div>

      {/* Mode Filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-foreground/70">Transport Type:</h4>
          <div className="flex gap-1">
            <button onClick={() => onModeChange(availableModes)} className="px-2 py-0.5 bg-accent/10 text-accent-foreground rounded text-[10px] font-bold hover:bg-accent/20 transition-all">All</button>
            <button onClick={() => onModeChange([])} className="px-2 py-0.5 bg-muted text-foreground/70 rounded text-[10px] font-bold hover:bg-muted/80 transition-all">None</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableModes.map((mode) => {
            const isSelected = selectedModes.includes(mode);
            
            return (
              <button
                key={mode}
                onClick={() => toggleMode(mode)}
                className={`
                  px-3 py-1 rounded-md border-2 transition-all text-sm font-bold
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-500/20 text-blue-600' 
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
      
      {/* Line Filter */}
      <div>
        <h4 className="font-medium text-sm text-foreground/70 mb-2">Lines:</h4>
        <div className="flex flex-wrap gap-2">
            {lines
            .filter(line => selectedModes.length === 0 || selectedModes.includes(line.mode))
            .map((line, index) => {
              const isSelected = selectedLines.includes(line.line);
              // Larger rectangles only for long names (mostly TER lines)
              const isLongName = line.line.length > 4 || line.line.includes(' ');
              
              return (
                <button
                  key={`${line.mode}-${line.line}-${index}`}
                  onClick={() => toggleLine(line.line)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all font-bold
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/20 text-blue-600' 
                      : 'border-border bg-card text-foreground/70 hover:border-accent'
                    }
                  `}
                >
                  <div 
                    className={`flex items-center justify-center text-white text-[10px] font-black ${isLongName ? 'px-3 h-6 rounded-md min-w-[3rem]' : 'w-6 h-6 rounded-full'}`}
                    style={{ backgroundColor: line.color }}
                  >
                    {line.line}
                  </div>
                  {!isLongName && (
                    <span className="font-medium text-xs">
                      {line.mode} {line.line}
                    </span>
                  )}
                  <span className="text-[10px] opacity-40 font-bold">
                    ({line.stations.length})
                  </span>
                </button>
              );
            })}
        </div>
      </div>
      
      <div className="mt-3 text-sm text-foreground/50 font-medium">
        {selectedLines.length === 0 
          ? 'No lines selected' 
          : `${selectedLines.length} line${selectedLines.length === 1 ? '' : 's'} selected`
        }
      </div>
    </div>
  );
}
