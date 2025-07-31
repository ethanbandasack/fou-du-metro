'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types/metro';

export function useTimer(autoStart: boolean = false) {
  const [timer, setTimer] = useState<TimerState>({
    seconds: 0,
    minutes: 0,
    hours: 0,
    isRunning: autoStart,
    isPaused: false
  });

  const [totalSeconds, setTotalSeconds] = useState(0);
  const prevAutoStartRef = useRef(autoStart);

  // Handle autoStart changes from parent
  useEffect(() => {
    if (autoStart !== prevAutoStartRef.current) {
      prevAutoStartRef.current = autoStart;
      
      if (autoStart) {
        // Parent wants timer to start
        setTimer(prev => ({
          ...prev,
          isRunning: true,
          isPaused: false
        }));
      } else {
        // Parent wants timer to stop/pause
        setTimer(prev => ({
          ...prev,
          isRunning: false,
          isPaused: true
        }));
      }
    }
  }, [autoStart]);

  // Reset timer when autoStart is false and we were previously running
  useEffect(() => {
    if (!autoStart && timer.isRunning) {
      setTimer(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false
      }));
    }
  }, [autoStart, timer.isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.isRunning && !timer.isPaused) {
      interval = setInterval(() => {
        setTotalSeconds(prev => {
          const newTotal = prev + 1;
          const hours = Math.floor(newTotal / 3600);
          const minutes = Math.floor((newTotal % 3600) / 60);
          const seconds = newTotal % 60;
          
          setTimer(prevTimer => ({
            ...prevTimer,
            hours,
            minutes,
            seconds
          }));
          
          return newTotal;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer.isRunning, timer.isPaused]);

  const start = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));
  }, []);

  const pause = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const stop = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false
    }));
  }, []);

  const reset = useCallback(() => {
    setTotalSeconds(0);
    setTimer({
      seconds: 0,
      minutes: 0,
      hours: 0,
      isRunning: false,
      isPaused: false
    });
  }, []);

  return {
    timer,
    totalSeconds,
    start,
    pause,
    stop,
    reset
  };
}
