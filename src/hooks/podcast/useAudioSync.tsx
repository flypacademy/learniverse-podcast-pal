
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
  
  // Only update state from store when significant changes occur and with much less frequency
  useEffect(() => {
    // If initial sync is not complete, don't process updates
    if (!initialSyncCompleteRef.current) return;
    
    // Skip if audio ref doesn't match store or if we're already syncing
    if (syncInProgressRef.current || !audioRef.current || audioRef.current !== audioStore.audioElement) {
      return;
    }
    
    // Aggressive throttling - only update once every 2 seconds max
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 2000) {
      return;
    }
    
    // Check if store values have actually changed significantly before updating local state
    const storeValues = {
      isPlaying: audioStore.isPlaying,
      currentTime: audioStore.currentTime,
      duration: audioStore.duration,
      volume: audioStore.volume
    };
    
    // Only proceed if there are truly meaningful differences
    const hasSignificantChanges = 
      storeValues.isPlaying !== lastStoreValuesRef.current.isPlaying ||
      Math.abs(storeValues.currentTime - lastStoreValuesRef.current.currentTime) > 5 || // 5 seconds difference
      Math.abs(storeValues.duration - lastStoreValuesRef.current.duration) > 5 ||
      Math.abs(storeValues.volume - lastStoreValuesRef.current.volume) > 10; // 10% volume difference
      
    if (!hasSignificantChanges) {
      return;
    }
    
    syncInProgressRef.current = true;
    lastUpdateTimeRef.current = now;
    
    // Use a timeout with cleanups to avoid update cycles
    const updateTimeout = setTimeout(() => {
      try {
        // Only update state if there's a significant difference to avoid render loops
        const localStatesDiffer = 
          isPlaying !== storeValues.isPlaying ||
          Math.abs(currentTime - storeValues.currentTime) > 5 ||
          (storeValues.duration > 0 && Math.abs(duration - storeValues.duration) > 5) ||
          Math.abs(volume - storeValues.volume) > 10;

        if (localStatesDiffer) {
          // Batch updates to minimize renders
          const batchedUpdates = () => {
            if (isPlaying !== storeValues.isPlaying) {
              setIsPlaying(storeValues.isPlaying);
            }
            
            if (isFinite(storeValues.currentTime) && Math.abs(currentTime - storeValues.currentTime) > 5) {
              setCurrentTime(storeValues.currentTime);
            }
            
            if (storeValues.duration > 0 && Math.abs(duration - storeValues.duration) > 5) {
              setDuration(storeValues.duration);
            }
            
            if (Math.abs(volume - storeValues.volume) > 10) {
              setVolume(storeValues.volume);
            }
          };
          
          // Execute the batched updates
          batchedUpdates();
        }
        
        // Update the last store values reference regardless
        lastStoreValuesRef.current = { ...storeValues };
      } catch (error) {
        console.error("Error during audio sync:", error);
      } finally {
        syncInProgressRef.current = false;
      }
    }, 150); // Increased delay to further reduce update frequency
    
    // Clean up the timeout if the component unmounts or dependencies change
    return () => clearTimeout(updateTimeout);
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
