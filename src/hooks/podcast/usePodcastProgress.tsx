
import { useState, useEffect } from "react";
import { useProgressTracking } from "./useProgressTracking";

export function usePodcastProgress(
  podcastId: string | undefined,
  audioRef: React.RefObject<HTMLAudioElement>,
  isPlaying: boolean,
  duration: number,
  currentTime: number,
  courseId?: string
) {
  const [initialPositionSet, setInitialPositionSet] = useState(false);
  
  // Initialize progress tracking
  const {
    saveProgress,
    handleCompletion,
    fetchUserProgress
  } = useProgressTracking(
    podcastId,
    audioRef.current,
    isPlaying,
    duration,
    currentTime,
    courseId
  );
  
  // Load saved progress when podcast data loads
  useEffect(() => {
    async function restoreProgress() {
      if (podcastId && audioRef.current && !initialPositionSet) {
        try {
          const progressData = await fetchUserProgress();
          if (progressData && progressData.last_position > 0) {
            console.log("Restoring saved position:", progressData.last_position);
            audioRef.current.currentTime = progressData.last_position;
          }
          setInitialPositionSet(true);
        } catch (err) {
          console.error("Error loading saved progress:", err);
        }
      }
    }
    
    restoreProgress();
  }, [podcastId, audioRef, initialPositionSet, fetchUserProgress]);

  return {
    saveProgress,
    handleCompletion,
    fetchUserProgress
  };
}
