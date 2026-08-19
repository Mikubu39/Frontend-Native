/**
 * useAudio hook
 *
 * Mock audio player hook for pronunciation and listening exercises.
 * Simulates audio playing state.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Audio } from "expo-av";

export function useAudio(url?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(
    async (overrideUrl?: string | any) => {
      const playUrl = typeof overrideUrl === "string" ? overrideUrl : url;
      if (
        !playUrl ||
        playUrl === "null" ||
        playUrl === "undefined" ||
        String(playUrl).trim() === ""
      )
        return;

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: playUrl },
          { shouldPlay: true },
        );

        soundRef.current = newSound;
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } catch (error) {
        console.warn("Error playing audio:", error);
        setIsPlaying(false);
      }
    },
    [url],
  );

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return {
    isPlaying,
    play,
    stop,
  };
}
