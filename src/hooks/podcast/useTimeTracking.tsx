
import { useState, useEffect, useRef } from "react";

export function useTimeTracking(
  isPlaying: boolean,
  audioElement: HTMLAudioElement | null,
  podcastId: string | undefined,
  onElapsedTime: (seconds: number) => void,
  saveProgressInterval = 5000
) {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const lastTimestampRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up tracking timers
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isPlaying && audioElement && podcastId) {
      console.log("Starting progress tracking for podcast:", podcastId);
      
      // Reset timestamp when playback starts
      lastTimestampRef.current = Date.now();
      
      // Set up new timer
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = now;
        
        if (isPlaying && audioElement && !audioElement.paused) {
          // Track elapsed time and notify parent
          onElapsedTime(elapsedSeconds);
          
          // Trigger progress save if needed
          if (now - lastSavedTime > saveProgressInterval) {
            setLastSavedTime(now);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, audioElement, podcastId, onElapsedTime, saveProgressInterval, lastSavedTime]);
  
  return {
    lastSavedTime,
    setLastSavedTime
  };
}
