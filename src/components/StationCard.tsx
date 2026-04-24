'use client';

import { MetroStation } from '@/types/metro';
import { Train, MapPin } from 'lucide-react';

interface StationCardProps {
  station: MetroStation;
  isGuessed?: boolean;
  showConnections?: boolean;
  hideContent?: boolean; // New prop to hide station details for quiz mode
  className?: string;
  onClick?: () => void;
}

export function StationCard({ 
  station, 
  isGuessed = false, 
  showConnections = false, 
  hideContent = false,
  className = '',
  onClick 
}: StationCardProps) {
  // For quiz mode: show content only if guessed, otherwise show placeholder
  const shouldShowContent = !hideContent || isGuessed;

  return (
    <div 
      className={`
        p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer min-h-[120px] flex flex-col justify-center
        ${isGuessed 
          ? 'bg-green-500/10 border-green-500 text-green-600' 
          : hideContent 
            ? 'bg-muted border-border hover:border-accent hover:bg-muted/80' 
            : 'bg-card border-border hover:border-accent'
        }
        ${className}
      `}
      onClick={onClick}
    >
      {shouldShowContent ? (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: station.lineColor }}
            >
              {station.line}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{station.nom_long}</h3>
              {station.nom_so_gar && (
                <p className="text-sm text-foreground/60">{station.nom_so_gar}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-foreground/60">
            <div className="flex items-center gap-1">
              <Train size={14} />
              <span>{station.mode} {station.line}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{station.exploitant}</span>
            </div>
          </div>
          
          {showConnections && station.connections && station.connections.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-foreground/50 mb-1 uppercase font-bold">Correspondances :</div>
              <div className="flex flex-wrap gap-1">
                {station.connections.map((connection, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs font-bold"
                  >
                    {connection}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {isGuessed && (
            <div className="mt-2 text-green-600 text-sm font-medium">
              ✓ Trouvé !
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-foreground/10 mx-auto mb-2 flex items-center justify-center text-foreground/40 text-sm font-bold border-2 border-border">
            ?
          </div>
          <div className="text-foreground/40 text-xs uppercase font-bold">Cliquer pour révéler</div>
        </div>
      )}
    </div>
  );
}
