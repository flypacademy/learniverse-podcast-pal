
import { useEffect, useRef } from "react";
import { AudioStore } from "@/lib/audioContext";

interface UseAudioSyncProps {
  globalAudioStore: AudioStore;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
}

export function useAudioSync({
  globalAudioStore,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume
}: UseAudioSyncProps) {
  const isInitialSyncRef = useRef(true);
  
  // Sync with global audio store if already playing
  useEffect(() => {
    if (globalAudioStore.audioElement && isInitialSyncRef.current) {
      console.log("Syncing state with global audio store");
      setIsPlaying(globalAudioStore.isPlaying);
      setCurrentTime(globalAudioStore.currentTime);
      setDuration(globalAudioStore.duration || 0);
      setVolume(globalAudioStore.volume);
      isInitialSyncRef.current = false;
    }
  }, [globalAudioStore, setIsPlaying, setCurrentTime, setDuration, setVolume]);
  
  return null;
}
