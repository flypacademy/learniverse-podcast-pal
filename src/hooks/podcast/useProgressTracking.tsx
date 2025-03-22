import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useXP } from "@/hooks/useXP";
import { XPReason } from "@/types/xp";
import { PodcastProgressData } from "@/types/podcast";
import { getUserSession } from "@/utils/xp/userSession";
import { recordDailyStreak } from "@/utils/xp/dailyStreakXP";

const LISTENING_XP_PER_MINUTE = 10;
const PODCAST_COMPLETION_XP = 50;

export function useProgressTracking(
  podcastId: string | undefined,
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean,
  duration: number,
  currentTime: number,
  courseId?: string
) {
  const { awardXP } = useXP();
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [listenedSeconds, setListenedSeconds] = useState(0);
  const [dailyStreakAwarded, setDailyStreakAwarded] = useState(false);
  const lastTimestampRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
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
  
  // Set up tracking timers
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isPlaying && audioElement && podcastId) {
      console.log("Starting progress tracking for podcast:", podcastId);
      
      // Reset timestamp when playback starts
      lastTimestampRef.current = Date.now();
      
      // Set up new timer
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = now;
        
        if (isPlaying && audioElement && !audioElement.paused) {
          // Track actual listened time
          setListenedSeconds(prev => prev + elapsedSeconds);
          
          // Save progress every 5 seconds
          if (now - lastSavedTime > 5000) {
            saveProgress();
            setLastSavedTime(now);
            
            // Award XP every minute (60 seconds)
            if (listenedSeconds >= 60) {
              const minutesListened = Math.floor(listenedSeconds / 60);
              if (minutesListened > 0) {
                console.log(`Awarding XP for ${minutesListened} minutes of listening`);
                awardXP(minutesListened * LISTENING_XP_PER_MINUTE, XPReason.LISTENING_TIME);
                setListenedSeconds(listenedSeconds % 60); // Keep remainder seconds
              }
            }
          }
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Final save on unmount
      if (audioElement && podcastId) {
        saveProgress();
        
        // Award XP for any remaining time
        if (listenedSeconds >= 10) { // Only award if at least 10 seconds listened
          const minutesListened = Math.floor(listenedSeconds / 60);
          if (minutesListened > 0) {
            awardXP(minutesListened * LISTENING_XP_PER_MINUTE, XPReason.LISTENING_TIME);
          }
        }
      }
    };
  }, [isPlaying, audioElement, podcastId, listenedSeconds]);
  
  // Save current progress to database
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
      
      console.log("Saving progress:", {
        podcastId,
        position: last_position,
        completed,
        courseId
      });
      
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('podcast_id', podcastId)
        .maybeSingle();
      
      const timestamp = new Date().toISOString();
      
      if (existingRecord) {
        // Update existing record
        await supabase
          .from('user_progress')
          .update({
            last_position,
            completed: completed || existingRecord.completed,
            course_id: courseId,
            updated_at: timestamp
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId);
      } else {
        // Insert new record
        await supabase
          .from('user_progress')
          .insert([
            {
              user_id: userId,
              podcast_id: podcastId,
              last_position,
              completed,
              course_id: courseId,
              updated_at: timestamp,
              created_at: timestamp
            }
          ]);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };
  
  // Handle podcast completion
  const handleCompletion = async () => {
    if (!podcastId) return false;
    
    try {
      await saveProgress(true);
      const success = await awardXP(PODCAST_COMPLETION_XP, XPReason.PODCAST_COMPLETION);
      return success;
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
      
      const { data } = await supabase
        .from('user_progress')
        .select('last_position, completed')
        .eq('podcast_id', podcastId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      return data;
    } catch (error) {
      console.error("Error fetching progress:", error);
      return null;
    }
  };
  
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
  
  return {
    saveProgress,
    handleCompletion,
    fetchUserProgress,
    awardListeningXP
  };
}
