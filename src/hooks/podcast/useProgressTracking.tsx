
import { useState, useEffect } from "react";
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
  
  // Save progress periodically while playing
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying && audioRef.current) {
        saveProgress(audioRef.current);
        
        // Track accumulated listening time for XP awards
        const currentTime = audioRef.current.currentTime;
        if (lastXpAwardTime > 0) {
          const newTime = Math.max(0, currentTime - lastXpAwardTime);
          setAccumulatedTime(prev => prev + newTime);
          
          // If we've accumulated more than 60 seconds, award XP and reset timer
          if (accumulatedTime + newTime > 60) {
            awardListeningXP();
          }
        }
        setLastXpAwardTime(currentTime);
      }
    }, 10000); // Save every 10 seconds while playing
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, audioRef, saveProgress, lastXpAwardTime, accumulatedTime]);
  
  // Award XP for accumulated listening time when component unmounts
  useEffect(() => {
    return () => {
      if (accumulatedTime > 30) { // Only award XP if more than 30 seconds accumulated
        awardListeningXP();
      }
    };
  }, []);
  
  // Award XP for listening time
  const awardListeningXP = async () => {
    try {
      if (accumulatedTime < 30) return; // Minimum threshold
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const xpAmount = calculateListeningXP(accumulatedTime);
      console.log(`Awarding XP for ${accumulatedTime} seconds of listening: ${xpAmount} XP`);
      
      if (xpAmount > 0) {
        await awardXP(
          session.user.id, 
          xpAmount, 
          "listening time", 
          toast
        );
        
        // Reset accumulated time after awarding XP
        setAccumulatedTime(0);
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
          await awardXP(
            session.user.id,
            XP_AMOUNTS.PODCAST_COMPLETION,
            "completing a podcast",
            toast
          );
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
