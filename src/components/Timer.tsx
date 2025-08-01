'use client';

import React from 'react';
import { useTimer } from '@/hooks/useTimer';
import { formatTime } from '@/utils/metroUtils';

interface TimerProps {
  autoStart?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  resetTrigger?: boolean;
  className?: string;
}

export function Timer({ autoStart = false, onTimeUpdate, resetTrigger, className = '' }: TimerProps) {
  const { timer, totalSeconds, stopAndReset } = useTimer(autoStart);

  // Notify parent component of time changes
  React.useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(totalSeconds);
    }
  }, [totalSeconds, onTimeUpdate]);

  // Reset timer when resetTrigger changes
  React.useEffect(() => {
    if (resetTrigger) {
      stopAndReset();
    }
  }, [resetTrigger, stopAndReset]);

  // Format time display
  const displayTime = formatTime(totalSeconds);

  return (
    <div className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-100 min-w-[80px]">
        {displayTime}
      </div>
      
      {timer.isPaused && (
        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
          Paused
        </div>
      )}
    </div>
  );
}
