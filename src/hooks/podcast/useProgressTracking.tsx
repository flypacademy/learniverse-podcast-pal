
import { useState, useEffect, useRef } from "react";
import { useProgressSaving } from "./useProgressSaving";
import { useProgressFetching } from "./useProgressFetching";
import { calculateListeningXP, XP_AMOUNTS } from "@/utils/xpUtils";
import { useXP } from "@/hooks/useXP";
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";

export function useProgressTracking(
  podcastId: string | undefined, 
  audioRef: React.RefObject<HTMLAudioElement>,
  isPlaying: boolean,
  podcastCourseId?: string
) {
  const { saveProgress } = useProgressSaving(podcastId, podcastCourseId);
  const { fetchUserProgress } = useProgressFetching(podcastId);
  const { awardXP, refreshXPData } = useXP();
  
  // Track listening time for XP awards
  const [lastXpAwardTime, setLastXpAwardTime] = useState<number>(0);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const xpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSaveRef = useRef<number>(0);
  const sourceRef = useRef<string>('main-player'); // Track where tracking was initiated
  
  // Set up dedicated XP award timer that runs when podcast is playing
  useEffect(() => {
    // Clear any existing timer when component mounts or dependencies change
    if (xpTimerRef.current) {
      clearInterval(xpTimerRef.current);
      xpTimerRef.current = null;
    }
    
    if (isPlaying && audioRef.current) {
      console.log(`useProgressTracking (${sourceRef.current}): Starting XP tracking timer for podcast ${podcastId}`);
      
      // Create a new timer to track XP with increased frequency
      xpTimerRef.current = setInterval(() => {
        if (!audioRef.current) return;
        
        const currentTime = audioRef.current.currentTime;
        if (lastXpAwardTime > 0) {
          const newTime = Math.max(0, currentTime - lastXpAwardTime);
          const newAccumulatedTime = accumulatedTime + newTime;
          setAccumulatedTime(newAccumulatedTime);
          
          // Save progress more frequently (every 3 seconds of real time)
          const now = Date.now();
          if (now - lastProgressSaveRef.current >= 3000) {
            saveProgress(audioRef.current);
            lastProgressSaveRef.current = now;
          }
          
          // Award XP every 60 seconds of listening
          if (newAccumulatedTime >= 60) {
            console.log(`XP timer (${sourceRef.current}): accumulated ${newAccumulatedTime} seconds of listening time`);
            awardListeningXP(newAccumulatedTime);
            setAccumulatedTime(0); // Reset accumulated time after awarding XP
          }
        }
        setLastXpAwardTime(currentTime);
      }, 1000); // Check every second for more accurate tracking
    }
    
    return () => {
      if (xpTimerRef.current) {
        clearInterval(xpTimerRef.current);
        xpTimerRef.current = null;
      }
    };
  }, [isPlaying, audioRef, lastXpAwardTime, accumulatedTime, podcastId]);
  
  // Save progress periodically while playing
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        saveProgress(audioRef.current);
        lastProgressSaveRef.current = Date.now();
      }
    }, 5000); // Save every 5 seconds while playing
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, audioRef, saveProgress]);
  
  // Award XP for accumulated listening time when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current && accumulatedTime > 0) { // Lower threshold to ensure we capture all time
        console.log(`Unmounting (${sourceRef.current}): saving final progress with ${audioRef.current.currentTime} seconds`);
        saveProgress(audioRef.current);
        
        // Award XP for any accumulated time
        if (accumulatedTime > 0) {
          awardListeningXP(accumulatedTime);
        }
      }
    };
  }, [audioRef, accumulatedTime]);
  
  // Award XP for listening time
  const awardListeningXP = async (seconds: number = accumulatedTime) => {
    if (seconds <= 0) return; // Only skip if zero or negative
    
    const xpAmount = calculateListeningXP(seconds);
    console.log(`Awarding XP for ${seconds} seconds of listening: ${xpAmount} XP (from ${sourceRef.current})`);
    
    if (xpAmount > 0) {
      const success = await awardXP(xpAmount, XPReason.LISTENING_TIME);
      
      if (success) {
        // Refresh XP data after awarding to update UI
        refreshXPData();
        // Reset accumulated time after awarding XP
        setAccumulatedTime(0);
      }
    }
  };
  
  const handleCompletion = async () => {
    if (audioRef.current) {
      // First award XP for any accumulated listening time
      await awardListeningXP();
      
      // Then save progress and mark as completed
      await saveProgress(audioRef.current, true);
      
      // Award XP for completing the podcast
      const completionSuccess = await awardXP(
        XP_AMOUNTS.PODCAST_COMPLETION,
        XPReason.PODCAST_COMPLETION
      );
      
      // Refresh XP data after awarding completion XP
      await refreshXPData();
      
      console.log(`Podcast completion XP award success (${sourceRef.current}):`, completionSuccess);
      return completionSuccess;
    }
    return false;
  };
  
  return {
    saveProgress: (completed = false) => audioRef.current && saveProgress(audioRef.current, completed),
    handleCompletion,
    fetchUserProgress,
    awardListeningXP
  };
}
