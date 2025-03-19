
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
  const { toast } = useToast();
  const { saveProgress } = useProgressSaving(podcastId, podcastCourseId);
  const { fetchUserProgress } = useProgressFetching(podcastId);
  
  // Track listening time for XP awards
  const [lastXpAwardTime, setLastXpAwardTime] = useState<number>(0);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const [showXpModal, setShowXpModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const xpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);
  
  // Get and store the user ID for XP awards
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        userIdRef.current = data.session.user.id;
      }
    };
    
    getUserId();
  }, []);
  
  // Set up dedicated XP award timer that runs when podcast is playing
  useEffect(() => {
    // Clear any existing timer when component mounts or dependencies change
    if (xpTimerRef.current) {
      clearInterval(xpTimerRef.current);
      xpTimerRef.current = null;
    }
    
    if (isPlaying && audioRef.current) {
      console.log("Starting XP tracking timer for podcast playback");
      
      // Create a new timer to track XP
      xpTimerRef.current = setInterval(async () => {
        if (!audioRef.current || !userIdRef.current) return;
        
        const currentTime = audioRef.current.currentTime;
        if (lastXpAwardTime > 0) {
          // Calculate time listened since last check
          const timeDiff = Math.max(0, currentTime - lastXpAwardTime);
          const newAccumulatedTime = accumulatedTime + timeDiff;
          setAccumulatedTime(newAccumulatedTime);
          
          // Award XP every 60 seconds of listening
          if (newAccumulatedTime >= 60) {
            console.log(`XP timer: accumulated ${newAccumulatedTime} seconds of listening time`);
            const awardedXp = await awardListeningXP(newAccumulatedTime);
            if (awardedXp > 0) {
              setXpEarned(awardedXp);
              setShowXpModal(true);
              
              // Hide XP modal after 3 seconds
              setTimeout(() => {
                setShowXpModal(false);
              }, 3000);
            }
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
  const awardListeningXP = async (seconds: number = accumulatedTime): Promise<number> => {
    try {
      if (!userIdRef.current || seconds < 30) return 0; // Minimum threshold
      
      const xpAmount = calculateListeningXP(seconds);
      console.log(`Awarding XP for ${seconds} seconds of listening: ${xpAmount} XP`);
      
      if (xpAmount > 0) {
        const showToastFn = (props: { title: string; description: string }) => {
          toast(props);
        };
        
        const success = await awardXP(
          userIdRef.current, 
          xpAmount, 
          "listening time", 
          showToastFn
        );
        
        console.log("XP award success:", success);
        
        if (success) {
          // Reset accumulated time after awarding XP
          setAccumulatedTime(0);
          return xpAmount;
        }
      }
      return 0;
    } catch (error) {
      console.error("Error awarding listening XP:", error);
      return 0;
    }
  };
  
  const handleCompletion = async () => {
    if (!audioRef.current || !userIdRef.current) return false;
    
    try {
      // First award XP for any accumulated listening time
      await awardListeningXP();
      
      // Then save progress and mark as completed
      await saveProgress(audioRef.current, true);
      
      // Award XP for completing the podcast
      const showToastFn = (props: { title: string; description: string }) => {
        toast(props);
      };
      
      const completionSuccess = await awardXP(
        userIdRef.current,
        XP_AMOUNTS.PODCAST_COMPLETION,
        "completing a podcast",
        showToastFn
      );
      
      console.log("Podcast completion XP award success:", completionSuccess);
      
      if (completionSuccess) {
        setXpEarned(XP_AMOUNTS.PODCAST_COMPLETION);
        setShowXpModal(true);
        
        // Hide XP modal after 3 seconds
        setTimeout(() => {
          setShowXpModal(false);
        }, 3000);
      }
      
      return completionSuccess;
    } catch (error) {
      console.error("Error in handleCompletion:", error);
      return false;
    }
  };
  
  return {
    saveProgress: (completed = false) => audioRef.current && saveProgress(audioRef.current, completed),
    handleCompletion,
    fetchUserProgress,
    awardListeningXP,
    showXpModal,
    xpEarned
  };
}
