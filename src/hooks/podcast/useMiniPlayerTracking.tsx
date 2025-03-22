import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { useProgressTracking } from "./useProgressTracking";
import { getUserSession } from "@/utils/xp/userSession";
import { recordDailyStreak } from "@/utils/xp/dailyStreakXP";

export function useMiniPlayerTracking(podcastId?: string, courseId?: string) {
  const {
    isPlaying,
    currentTime,
    duration,
    audioElement,
    currentPodcastId
  } = useAudioStore();
  
  const progressTrackingRef = useRef(false);
  const [dailyStreakAwarded, setDailyStreakAwarded] = useState(false);
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
  
  // Award daily streak XP when playing in mini player
  useEffect(() => {
    if (isPlaying && audioElement && !dailyStreakAwarded) {
      const awardDailyStreakXP = async () => {
        try {
          const userId = await getUserSession();
          if (!userId) return;
          
          const streakRecorded = await recordDailyStreak(userId);
          if (streakRecorded) {
            console.log("Daily streak XP awarded from mini player");
            setDailyStreakAwarded(true);
          }
        } catch (err) {
          console.error("Error awarding daily streak XP from mini player:", err);
        }
      };
      
      awardDailyStreakXP();
    }
  }, [isPlaying, audioElement, dailyStreakAwarded]);
  
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
    isTracking: progressTrackingRef.current,
    podcastId: actualPodcastId
  };
}
