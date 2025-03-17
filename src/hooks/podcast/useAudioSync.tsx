
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
      console.log("useAudioPlayer: Initializing from global store");
      
      // We need to use a local variable instead of directly modifying the ref
      // to avoid the TypeScript error with read-only properties
      const wasInitialized = storeInitializedRef.current;
      
      // Set the ref value to true AFTER checking it
      storeInitializedRef.current = true;
      
      if (!wasInitialized) {
        // This is safe since we're not modifying the ref itself, just what it points to
        audioRef.current = audioStore.audioElement;
        
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
    }
  }, [audioStore, podcastId, setCurrentTime, setDuration, setIsPlaying, setReady, setVolume, audioRef]);
  
  // Only update state from store if significant time has passed (throttling)
  // and only for specific properties that have changed significantly
  useEffect(() => {
    // Skip if audio ref doesn't match store or if we're already syncing
    if (syncInProgressRef.current || !audioRef.current || audioRef.current !== audioStore.audioElement) {
      return;
    }
    
    // Throttle updates to avoid excessive re-renders
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 500) { // 500ms throttle
      return;
    }
    
    syncInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    
    try {
      // Only update state if there's a significant difference to avoid render loops
      if (isPlaying !== audioStore.isPlaying) {
        setIsPlaying(audioStore.isPlaying);
      }
      
      if (isFinite(audioStore.currentTime) && Math.abs(currentTime - audioStore.currentTime) > 1) {
        setCurrentTime(audioStore.currentTime);
      }
      
      if (audioStore.duration > 0 && Math.abs(duration - audioStore.duration) > 1) {
        setDuration(audioStore.duration);
      }
      
      if (Math.abs(volume - audioStore.volume) > 2) {
        setVolume(audioStore.volume);
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
