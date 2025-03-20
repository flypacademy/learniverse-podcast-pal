
import { useEffect, useRef } from "react";
import { useProgressTracking } from "./useProgressTracking";
import { XPReason } from "@/types/xp";

interface UseMiniPlayerTrackingProps {
  podcastId: string;
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
}

export function useMiniPlayerTracking({
  podcastId,
  isPlaying,
  audioElement
}: UseMiniPlayerTrackingProps) {
  const { saveProgress, awardXP } = useProgressTracking(
    podcastId,
    { current: audioElement },
    isPlaying,
    undefined
  );
  
  // Track listening time for XP
  const lastTimestampRef = useRef(Date.now());
  const accumulatedTimeRef = useRef(0);
  
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout | null = null;
    
    if (isPlaying && audioElement && podcastId) {
      console.log("MiniPlayer: Starting XP tracking interval");
      lastTimestampRef.current = Date.now();
      
      // Track time and save progress while playing
      trackingInterval = setInterval(() => {
        if (audioElement) {
          // Calculate time elapsed since last check (in seconds)
          const now = Date.now();
          const elapsed = (now - lastTimestampRef.current) / 1000;
          lastTimestampRef.current = now;
          
          // Only count time if actually playing
          if (isPlaying && !audioElement.paused) {
            accumulatedTimeRef.current += elapsed;
            
            // Award XP every full minute (60 seconds)
            if (accumulatedTimeRef.current >= 60) {
              console.log(`MiniPlayer: Awarding XP for ${Math.floor(accumulatedTimeRef.current)} seconds of listening`);
              const minutes = Math.floor(accumulatedTimeRef.current / 60);
              awardXP(minutes * 10, XPReason.LISTENING_TIME);
              accumulatedTimeRef.current = accumulatedTimeRef.current % 60;
            }
          }
          
          // Save current progress
          saveProgress();
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
        
        // Award XP for any accumulated listening time when unmounting
        if (audioElement && podcastId && accumulatedTimeRef.current > 10) { // Only award if meaningful time spent
          console.log(`MiniPlayer: Unmounting - awarding XP for ${accumulatedTimeRef.current} seconds`);
          const minutes = Math.floor(accumulatedTimeRef.current / 60);
          if (minutes > 0) {
            awardXP(minutes * 10, XPReason.LISTENING_TIME);
          }
        }
      }
    };
  }, [isPlaying, audioElement, podcastId, saveProgress, awardXP]);

  return {
    saveProgress
  };
}
