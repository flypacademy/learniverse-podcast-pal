
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
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStoreValuesRef = useRef({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0
  });
  
  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, []);
  
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
      setIsPlaying(false); // Always start paused to prevent autoplay issues
      setReady(true);
      
      // Reset the audio element's current time to ensure we start from the beginning
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      
      // Save initial store values to prevent unnecessary updates
      lastStoreValuesRef.current = {
        isPlaying: false, // Force to false initially
        currentTime: 0,
        duration: audioStore.duration,
        volume: audioStore.volume
      };
      
      initialSyncCompleteRef.current = true;
    }
  }, [audioStore, podcastId, setCurrentTime, setDuration, setIsPlaying, setReady, setVolume, audioRef]);
  
  // Completely separate effect for updates from store to avoid loops
  useEffect(() => {
    // Skip if initial sync is not complete or if we don't have matching conditions
    if (!initialSyncCompleteRef.current || 
        !audioRef.current || 
        audioRef.current !== audioStore.audioElement ||
        audioStore.currentPodcastId !== podcastId) {
      return;
    }
    
    // Prevent rapid updates by using an aggressive throttle
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 3000 || syncInProgressRef.current) {
      return;
    }
    
    const storeValues = {
      isPlaying: audioStore.isPlaying,
      currentTime: audioStore.currentTime,
      duration: audioStore.duration,
      volume: audioStore.volume
    };
    
    // Check if store values have changed significantly
    const hasSignificantChanges = 
      storeValues.isPlaying !== lastStoreValuesRef.current.isPlaying ||
      Math.abs(storeValues.currentTime - lastStoreValuesRef.current.currentTime) > 10 || // 10 seconds difference
      Math.abs(storeValues.duration - lastStoreValuesRef.current.duration) > 10 ||
      Math.abs(storeValues.volume - lastStoreValuesRef.current.volume) > 15; // 15% volume difference
      
    if (!hasSignificantChanges) {
      return;
    }
    
    // Set a flag to prevent concurrent updates
    syncInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    
    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Use a timeout to batch updates and avoid immediate re-renders
    updateTimeoutRef.current = setTimeout(() => {
      try {
        // Only update state if component is still mounted and values differ significantly
        if (audioRef.current) {
          // Update playing state if different
          if (storeValues.isPlaying !== isPlaying) {
            setIsPlaying(storeValues.isPlaying);
          }
          
          // Update time if significantly different
          if (isFinite(storeValues.currentTime) && 
              Math.abs(currentTime - storeValues.currentTime) > 10) {
            setCurrentTime(storeValues.currentTime);
          }
          
          // Update duration if valid and significantly different
          if (storeValues.duration > 0 && 
              Math.abs(duration - storeValues.duration) > 10) {
            setDuration(storeValues.duration);
          }
          
          // Update volume if significantly different
          if (Math.abs(volume - storeValues.volume) > 15) {
            setVolume(storeValues.volume);
          }
        }
        
        // Update the last store values reference
        lastStoreValuesRef.current = { ...storeValues };
      } catch (error) {
        console.error("Error during audio sync:", error);
      } finally {
        // Reset the sync flag and clear the timeout reference
        syncInProgressRef.current = false;
        updateTimeoutRef.current = null;
      }
    }, 200);
    
  }, [
    audioStore.isPlaying,
    audioStore.currentTime,
    audioStore.duration,
    audioStore.volume,
    podcastId,
    audioRef,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    isPlaying,
    currentTime,
    duration,
    volume
  ]);

  return {
    syncInProgressRef
  };
}
