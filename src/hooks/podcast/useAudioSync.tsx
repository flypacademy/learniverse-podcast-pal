
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";

export function useAudioSync(
  podcastId: string | undefined,
  audioRef: React.RefObject<HTMLAudioElement>,
  currentTime: number,
  duration: number,
  volume: number,
  isPlaying: boolean,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  setDuration: React.Dispatch<React.SetStateAction<number>>,
  setVolume: React.Dispatch<React.SetStateAction<number>>,
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  setReady: React.Dispatch<React.SetStateAction<boolean>>
) {
  const audioStore = useAudioStore();
  const storeInitializedRef = useRef(false);
  const syncInProgressRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  
  // Initialize audio from global store if available, but only once
  useEffect(() => {
    if (!storeInitializedRef.current && audioStore.currentPodcastId === podcastId && audioStore.audioElement) {
      console.log("useAudioSync: Initializing from global store");
      storeInitializedRef.current = true;
      
      // Use safe values to prevent uncontrolled/controlled component switches
      if (isFinite(audioStore.currentTime)) {
        setCurrentTime(audioStore.currentTime);
      }
      
      if (isFinite(audioStore.duration) && audioStore.duration > 0) {
        setDuration(audioStore.duration);
      }
      
      setVolume(audioStore.volume);
      setIsPlaying(audioStore.isPlaying);
      setReady(true);
    }
  }, [audioStore, podcastId, setCurrentTime, setDuration, setIsPlaying, setReady, setVolume]);
  
  // Only update state from store if significant time has passed (throttling)
  // and only for specific properties that have changed significantly
  useEffect(() => {
    // Skip if audio ref doesn't match store or if we're already syncing
    if (syncInProgressRef.current || !audioRef.current || audioRef.current !== audioStore.audioElement) {
      return;
    }
    
    // Throttle updates to avoid excessive re-renders
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 1000) { // 1000ms throttle (reduced frequency)
      return;
    }
    
    syncInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    
    try {
      // Only update state if there's a significant difference to avoid render loops
      if (isPlaying !== audioStore.isPlaying) {
        setIsPlaying(audioStore.isPlaying);
      }
      
      // Create local variables to avoid excessive property access
      const storeTime = audioStore.currentTime;
      const storeDuration = audioStore.duration;
      const storeVolume = audioStore.volume;
      
      if (isFinite(storeTime) && Math.abs(currentTime - storeTime) > 1) {
        setCurrentTime(storeTime);
      }
      
      if (storeDuration > 0 && Math.abs(duration - storeDuration) > 1) {
        setDuration(storeDuration);
      }
      
      if (Math.abs(volume - storeVolume) > 2) {
        setVolume(storeVolume);
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [
    audioStore.isPlaying,
    audioStore.currentTime,
    audioStore.duration,
    audioStore.volume,
    isPlaying,
    currentTime,
    duration,
    volume,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    audioRef
  ]);

  return {
    syncInProgressRef
  };
}
