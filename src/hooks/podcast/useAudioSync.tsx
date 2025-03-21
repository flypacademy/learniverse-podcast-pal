
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
  const initialSyncCompleteRef = useRef(false);
  const lastStoreValuesRef = useRef({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0
  });
  
  // Only initialize from the store once when the component mounts
  useEffect(() => {
    // Only sync from store if we're loading the same podcast and we haven't synced yet
    if (!storeInitializedRef.current && audioStore.currentPodcastId === podcastId && audioStore.audioElement) {
      console.log("useAudioSync: Initializing from global store");
      storeInitializedRef.current = true;
      
      // Always start from beginning when opening a podcast
      setCurrentTime(0);
      
      // Only set other values if they're valid
      if (isFinite(audioStore.duration) && audioStore.duration > 0) {
        setDuration(audioStore.duration);
      }
      
      setVolume(audioStore.volume);
      setIsPlaying(audioStore.isPlaying);
      setReady(true);
      
      // Reset the audio element's current time to ensure we start from the beginning
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      
      // Save initial store values to prevent unnecessary updates
      lastStoreValuesRef.current = {
        isPlaying: audioStore.isPlaying,
        currentTime: audioStore.currentTime,
        duration: audioStore.duration,
        volume: audioStore.volume
      };
      
      initialSyncCompleteRef.current = true;
    }
  }, [audioStore, podcastId, setCurrentTime, setDuration, setIsPlaying, setReady, setVolume, audioRef]);
  
  // Only update state from store when significant changes occur
  useEffect(() => {
    // If initial sync is complete and this is just a normal update, we can be more selective
    if (!initialSyncCompleteRef.current) return;
    
    // Skip if audio ref doesn't match store or if we're already syncing
    if (syncInProgressRef.current || !audioRef.current || audioRef.current !== audioStore.audioElement) {
      return;
    }
    
    // Throttle updates to avoid excessive re-renders
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 1000) { // 1000ms throttle (reduced frequency)
      return;
    }
    
    // Check if store values have actually changed before updating local state
    const storeValues = {
      isPlaying: audioStore.isPlaying,
      currentTime: audioStore.currentTime,
      duration: audioStore.duration,
      volume: audioStore.volume
    };
    
    // Only proceed if there are meaningful differences
    const hasSignificantChanges = 
      storeValues.isPlaying !== lastStoreValuesRef.current.isPlaying ||
      Math.abs(storeValues.currentTime - lastStoreValuesRef.current.currentTime) > 1.5 ||
      Math.abs(storeValues.duration - lastStoreValuesRef.current.duration) > 1.5 ||
      Math.abs(storeValues.volume - lastStoreValuesRef.current.volume) > 3;
      
    if (!hasSignificantChanges) {
      return;
    }
    
    syncInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    
    try {
      // Use a local state update timeout to break potential update cycles
      const updateTimeout = setTimeout(() => {
        // Only update state if there's a significant difference to avoid render loops
        if (isPlaying !== storeValues.isPlaying) {
          setIsPlaying(storeValues.isPlaying);
        }
        
        // Only update time if the difference is significant
        if (isFinite(storeValues.currentTime) && Math.abs(currentTime - storeValues.currentTime) > 1.5) {
          setCurrentTime(storeValues.currentTime);
        }
        
        if (storeValues.duration > 0 && Math.abs(duration - storeValues.duration) > 1.5) {
          setDuration(storeValues.duration);
        }
        
        if (Math.abs(volume - storeValues.volume) > 3) {
          setVolume(storeValues.volume);
        }
        
        // Update the last store values reference
        lastStoreValuesRef.current = { ...storeValues };
        syncInProgressRef.current = false;
      }, 50);
      
      // Clean up the timeout if the component unmounts or dependencies change
      return () => clearTimeout(updateTimeout);
    } catch (error) {
      console.error("Error during audio sync:", error);
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
