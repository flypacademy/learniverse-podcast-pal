
import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { useProgressTracking } from "./useProgressTracking";

export function useMiniPlayerTracking(podcastId?: string, courseId?: string) {
  const {
    isPlaying,
    currentTime,
    duration,
    audioElement,
    currentPodcastId
  } = useAudioStore();
  
  const progressTrackingRef = useRef(false);
  const actualPodcastId = podcastId || currentPodcastId;
  
  // Use the progress tracking hook for saving progress during mini player usage
  const { saveProgress } = useProgressTracking(
    actualPodcastId,
    audioElement,
    isPlaying,
    duration,
    currentTime,
    courseId
  );
  
  // Save progress periodically when playing in mini player
  useEffect(() => {
    if (!actualPodcastId || progressTrackingRef.current) return;
    
    // Set up regular progress saving
    progressTrackingRef.current = true;
    console.log("MiniPlayer tracking: Starting progress tracking for", actualPodcastId);
    
    const saveInterval = setInterval(() => {
      if (currentTime > 0 && isPlaying) {
        console.log("MiniPlayer tracking: Saving progress", {
          podcastId: actualPodcastId,
          currentTime
        });
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
  }, [actualPodcastId, currentTime, saveProgress, isPlaying]);
  
  return {
    isTracking: progressTrackingRef.current
  };
}
