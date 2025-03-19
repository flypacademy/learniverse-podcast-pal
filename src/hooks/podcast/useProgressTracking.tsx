
import { useState, useEffect, useRef } from "react";
import { useProgressSaving } from "./useProgressSaving";
import { useProgressFetching } from "./useProgressFetching";
import { awardXP, calculateListeningXP, XP_AMOUNTS } from "@/utils/xpUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function useProgressTracking(
  podcastId: string | undefined, 
  audioRef: React.RefObject<HTMLAudioElement>,
  isPlaying: boolean,
  podcastCourseId?: string
) {
  const toast = useToast();
  const { saveProgress } = useProgressSaving(podcastId, podcastCourseId);
  const { fetchUserProgress } = useProgressFetching(podcastId);
  
  // Track listening time for XP awards
  const [lastXpAwardTime, setLastXpAwardTime] = useState<number>(0);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const xpTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up dedicated XP award timer that runs more frequently
  useEffect(() => {
    // Clear any existing timer when component mounts or dependencies change
    if (xpTimerRef.current) {
      clearInterval(xpTimerRef.current);
      xpTimerRef.current = null;
    }
    
    if (isPlaying && audioRef.current) {
      // Create a new timer to track XP
      xpTimerRef.current = setInterval(() => {
        if (!audioRef.current) return;
        
        const currentTime = audioRef.current.currentTime;
        if (lastXpAwardTime > 0) {
          const newTime = Math.max(0, currentTime - lastXpAwardTime);
          const newAccumulatedTime = accumulatedTime + newTime;
          setAccumulatedTime(newAccumulatedTime);
          
          // Award XP every 60 seconds of listening
          if (newAccumulatedTime >= 60) {
            console.log(`XP timer: accumulated ${newAccumulatedTime} seconds of listening time`);
            awardListeningXP(newAccumulatedTime);
            setAccumulatedTime(0); // Reset accumulated time after awarding XP
          }
        }
        setLastXpAwardTime(currentTime);
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (xpTimerRef.current) {
        clearInterval(xpTimerRef.current);
        xpTimerRef.current = null;
      }
    };
  }, [isPlaying, audioRef, lastXpAwardTime, accumulatedTime]);
  
  // Save progress periodically while playing
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        saveProgress(audioRef.current);
      }
    }, 10000); // Save every 10 seconds while playing
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, audioRef, saveProgress]);
  
  // Award XP for accumulated listening time when component unmounts
  useEffect(() => {
    return () => {
      if (accumulatedTime > 30) { // Only award XP if more than 30 seconds accumulated
        awardListeningXP(accumulatedTime);
      }
    };
  }, []);
  
  // Award XP for listening time
  const awardListeningXP = async (seconds: number = accumulatedTime) => {
    try {
      if (seconds < 30) return; // Minimum threshold
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("No user session found, cannot award XP");
        return;
      }
      
      const xpAmount = calculateListeningXP(seconds);
      console.log(`Awarding XP for ${seconds} seconds of listening: ${xpAmount} XP`);
      
      if (xpAmount > 0) {
        const success = await awardXP(
          session.user.id, 
          xpAmount, 
          "listening time", 
          toast
        );
        
        console.log("XP award success:", success);
        
        if (success) {
          // Reset accumulated time after awarding XP
          setAccumulatedTime(0);
        }
      }
    } catch (error) {
      console.error("Error awarding listening XP:", error);
    }
  };
  
  const handleCompletion = async () => {
    if (audioRef.current) {
      // First award XP for any accumulated listening time
      await awardListeningXP();
      
      // Then save progress and mark as completed
      await saveProgress(audioRef.current, true);
      
      // Award XP for completing the podcast
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const completionSuccess = await awardXP(
            session.user.id,
            XP_AMOUNTS.PODCAST_COMPLETION,
            "completing a podcast",
            toast
          );
          
          console.log("Podcast completion XP award success:", completionSuccess);
          return completionSuccess;
        }
      } catch (error) {
        console.error("Error awarding completion XP:", error);
      }
      
      return true; // Signal completion was successful
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
