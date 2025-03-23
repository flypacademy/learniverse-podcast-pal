
import { useState, useEffect } from "react";
import { useXP } from "@/hooks/useXP";
import { XPReason } from "@/types/xp";
import { getUserSession } from "@/utils/xp/userSession";
import { recordDailyStreak } from "@/utils/xp/dailyStreakXP";

const LISTENING_XP_PER_MINUTE = 10;
const PODCAST_COMPLETION_XP = 50;

export function useXPTracking(
  podcastId: string | undefined,
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean
) {
  const { awardXP } = useXP();
  const [listenedSeconds, setListenedSeconds] = useState(0);
  const [dailyStreakAwarded, setDailyStreakAwarded] = useState(false);
  
  // Award daily streak XP when user starts listening
  useEffect(() => {
    if (isPlaying && audioElement && podcastId && !dailyStreakAwarded) {
      const awardDailyStreakXP = async () => {
        try {
          const userId = await getUserSession();
          if (!userId) return;
          
          const streakRecorded = await recordDailyStreak(userId);
          if (streakRecorded) {
            console.log("Daily streak XP awarded successfully");
            setDailyStreakAwarded(true);
          }
        } catch (err) {
          console.error("Error awarding daily streak XP:", err);
        }
      };
      
      awardDailyStreakXP();
    }
  }, [isPlaying, audioElement, podcastId, dailyStreakAwarded]);
  
  // Award XP for listening time
  const awardListeningXP = async (seconds = 0) => {
    if (seconds < 10) return false;
    
    try {
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) {
        return await awardXP(minutes * LISTENING_XP_PER_MINUTE, XPReason.LISTENING_TIME);
      }
      return false;
    } catch (error) {
      console.error("Error awarding listening XP:", error);
      return false;
    }
  };
  
  // Handle podcast completion XP
  const awardCompletionXP = async () => {
    try {
      console.log("Awarding completion XP for podcast", podcastId);
      return await awardXP(PODCAST_COMPLETION_XP, XPReason.PODCAST_COMPLETION);
    } catch (error) {
      console.error("Error awarding completion XP:", error);
      return false;
    }
  };
  
  return {
    listenedSeconds,
    setListenedSeconds,
    awardListeningXP,
    awardCompletionXP
  };
}
