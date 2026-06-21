/**
 * useAudio hook
 *
 * Mock audio player hook for pronunciation and listening exercises.
 * Simulates audio playing state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudio(durationMs = 1500) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const play = useCallback(() => {
    // If already playing, stop first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(true);
    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    isPlaying,
    play,
    stop,
  };
}
