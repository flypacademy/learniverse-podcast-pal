
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PodcastProgressData } from "@/types/podcast";
import { useXPTracking } from "./useXPTracking";
import { useCompletionDetection } from "./useCompletionDetection";
import { useTimeTracking } from "./useTimeTracking";
import { useProgressDatabase } from "./useProgressDatabase";

export function useProgressTracking(
  podcastId: string | undefined,
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean,
  duration: number,
  currentTime: number,
  courseId?: string
) {
  const [listenedTime, setListenedTime] = useState(0);
  
  // Use the XP tracking hook
  const {
    listenedSeconds,
    setListenedSeconds,
    awardListeningXP,
    awardCompletionXP
  } = useXPTracking(podcastId, audioElement, isPlaying);
  
  // Use the progress database hook
  const {
    saveProgressToDatabase,
    fetchProgressFromDatabase
  } = useProgressDatabase();
  
  // Save progress to database
  const saveProgress = async (completed = false) => {
    if (!audioElement || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("No active session, can't save progress");
        return;
      }
      
      const userId = session.user.id;
      const last_position = Math.floor(currentTime);
      
      // Use completion detection to determine if the podcast is completed
      const isCompleted = completed || isPositionCompleted(last_position);
      
      const { updated, shouldAwardCompletionXP } = await saveProgressToDatabase(
        userId,
        podcastId,
        last_position,
        isCompleted,
        courseId
      );
      
      // Award completion XP if needed
      if (updated && shouldAwardCompletionXP) {
        await awardCompletionXP();
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };
  
  // Use the completion detection hook
  const { isPositionCompleted } = useCompletionDetection(
    podcastId,
    duration,
    currentTime,
    saveProgress
  );
  
  // Handle time tracking and XP awarding
  const handleElapsedTime = (elapsedSeconds: number) => {
    setListenedSeconds(prev => prev + elapsedSeconds);
    setListenedTime(prev => prev + elapsedSeconds);
    
    // Award XP for listening time if we've accumulated enough
    if (listenedSeconds >= 60) {
      const minutesListened = Math.floor(listenedSeconds / 60);
      if (minutesListened > 0) {
        console.log(`Awarding XP for ${minutesListened} minutes of listening`);
        awardListeningXP(minutesListened * 60);
        setListenedSeconds(listenedSeconds % 60); // Keep remainder seconds
      }
    }
    
    // Save progress periodically
    saveProgress();
  };
  
  // Use the time tracking hook
  useTimeTracking(
    isPlaying,
    audioElement,
    podcastId,
    handleElapsedTime
  );
  
  // Clean up and final save on unmount
  useEffect(() => {
    return () => {
      // Final save on unmount
      if (audioElement && podcastId) {
        saveProgress();
        
        // Award XP for any remaining time
        if (listenedSeconds >= 10) { // Only award if at least 10 seconds listened
          awardListeningXP(listenedSeconds);
        }
      }
    };
  }, [audioElement, podcastId, listenedSeconds]);
  
  // Handle podcast completion
  const handleCompletion = async () => {
    if (!podcastId) return false;
    
    try {
      await saveProgress(true);
      return true;
    } catch (error) {
      console.error("Error handling completion:", error);
      return false;
    }
  };
  
  // Fetch user progress
  const fetchUserProgress = async (): Promise<PodcastProgressData | null> => {
    if (!podcastId) return null;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      return await fetchProgressFromDatabase(session.user.id, podcastId);
    } catch (error) {
      console.error("Error fetching progress:", error);
      return null;
    }
  };
  
  return {
    saveProgress,
    handleCompletion,
    fetchUserProgress,
    awardListeningXP
  };
}
