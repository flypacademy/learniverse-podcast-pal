
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";

export function useAudioControls(
  audioRef: React.RefObject<HTMLAudioElement>, 
  duration: number, 
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  syncInProgressRef: React.MutableRefObject<boolean>
) {
  const audioStore = useAudioStore();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const lastActionTimeRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);
  
  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, []);
  
  const throttleAction = (minInterval = 500): boolean => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < minInterval) {
      return false; // Too soon for another action
    }
    lastActionTimeRef.current = now;
    return true;
  };
  
  // Safe store update with debouncing
  const updateStore = (callback: () => void) => {
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      try {
        callback();
      } finally {
        isUpdatingRef.current = false;
        updateTimeoutRef.current = null;
      }
    }, 300);
  };
  
  const play = () => {
    if (!audioRef.current || !throttleAction(800)) return;
    
    try {
      const storeAudioElement = audioStore.audioElement;
      if (storeAudioElement && storeAudioElement !== audioRef.current && !storeAudioElement.paused) {
        console.log("Stopping other audio before playing this one");
        storeAudioElement.pause();
      }
      
      console.log("Play called, attempting to play audio");
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Audio playback started successfully");
            // Only update the store if our local state changed and not already syncing
            if (!audioStore.isPlaying && !syncInProgressRef.current) {
              updateStore(() => audioStore.play());
            }
          })
          .catch(error => {
            console.error("Error playing audio:", error);
          });
      }
    } catch (error) {
      console.error("Exception during play:", error);
    }
  };
  
  const pause = () => {
    if (!audioRef.current || !throttleAction(500)) return;
    
    try {
      console.log("Pause called, pausing audio");
      audioRef.current.pause();
      // Only update the store if our local state changed and not already syncing
      if (audioStore.isPlaying && !syncInProgressRef.current) {
        updateStore(() => audioStore.pause());
      }
    } catch (error) {
      console.error("Error pausing audio:", error);
    }
  };
  
  const togglePlayPause = (isPlaying: boolean) => {
    console.log("Toggle play/pause with isPlaying:", isPlaying);
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (percent: number) => {
    if (!audioRef.current || duration <= 0 || !throttleAction(300)) return;
    
    try {
      // Further debounce seek operations to prevent rapid successive updates
      const now = Date.now();
      if (now - lastSeekTimeRef.current < 500) {
        return; // Ignore rapid seek events
      }
      lastSeekTimeRef.current = now;
      
      const newTime = (percent / 100) * duration;
      console.log("Seeking to position:", newTime, "seconds");
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Only update store if not already syncing, and with a delay
      if (!syncInProgressRef.current) {
        updateStore(() => audioStore.setCurrentTime(newTime));
      }
    } catch (error) {
      console.error("Error seeking audio:", error);
    }
  };
  
  const changeVolume = (value: number) => {
    if (!audioRef.current || !throttleAction(500)) return;
    
    try {
      const volumeValue = value / 100;
      audioRef.current.volume = Math.max(0, Math.min(1, volumeValue));
      
      // Only update store if not already syncing, and with a delay
      if (!syncInProgressRef.current) {
        updateStore(() => audioStore.setVolume(value));
      }
    } catch (error) {
      console.error("Error changing volume:", error);
    }
  };
  
  const skipForward = () => {
    if (!audioRef.current || !throttleAction(500)) return;
    
    try {
      const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Only update store if not already syncing
      if (!syncInProgressRef.current) {
        updateStore(() => audioStore.setCurrentTime(newTime));
      }
    } catch (error) {
      console.error("Error skipping forward:", error);
    }
  };
  
  const skipBackward = () => {
    if (!audioRef.current || !throttleAction(500)) return;
    
    try {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Only update store if not already syncing
      if (!syncInProgressRef.current) {
        updateStore(() => audioStore.setCurrentTime(newTime));
      }
    } catch (error) {
      console.error("Error skipping backward:", error);
    }
  };

  return {
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward
  };
}
