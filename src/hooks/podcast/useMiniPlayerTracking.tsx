
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { useProgressTracking } from "./useProgressTracking";

export function useMiniPlayerTracking(podcastId?: string, courseId?: string) {
  const {
    isPlaying,
    currentTime,
    duration,
    audioElement
  } = useAudioStore();
  
  const progressTrackingRef = useRef(false);
  
  // Use the progress tracking hook for saving progress during mini player usage
  const { saveProgress } = useProgressTracking(
    podcastId,
    audioElement,
    isPlaying,
    duration,
    currentTime,
    courseId
  );
  
  // Save progress periodically when playing in mini player
  useEffect(() => {
    if (!podcastId || !isPlaying || progressTrackingRef.current) return;
    
    // Set up regular progress saving
    progressTrackingRef.current = true;
    console.log("MiniPlayer tracking: Starting progress tracking");
    
    const saveInterval = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        saveProgress();
      }
    }, 5000); // Save every 5 seconds
    
    return () => {
      clearInterval(saveInterval);
      progressTrackingRef.current = false;
      console.log("MiniPlayer tracking: Stopping progress tracking");
      
      // Save progress one last time when cleaning up
      if (currentTime > 0) {
        saveProgress();
      }
    };
  }, [podcastId, isPlaying, currentTime, saveProgress]);
  
  return {
    isTracking: progressTrackingRef.current
  };
}
