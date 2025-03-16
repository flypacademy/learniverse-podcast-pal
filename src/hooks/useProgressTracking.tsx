
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { PodcastData } from "@/types/podcast";

export function useProgressTracking(
  podcastId: string | undefined,
  isPlaying: boolean,
  podcastData: PodcastData | null
) {
  const [showXPModal, setShowXPModal] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);

  const saveProgress = async (completed = false) => {
    if (!podcastId) {
      console.warn("saveProgress called but podcastId is null");
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("No user session found, not saving progress");
      return;
    }
    
    const userId = session.user.id;
    const audioElement = document.querySelector('audio');
    const last_position = audioElement ? Math.floor(audioElement.currentTime) : 0;
    
    console.log("Saving progress:", { podcastId, userId, last_position, completed });
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: userId,
            podcast_id: podcastId,
            last_position: last_position,
            completed: completed,
            course_id: podcastData?.course_id
          }
        ]);
      
      if (error) {
        console.error("Error saving progress:", error);
      } else {
        console.log("Progress saved successfully");
      }
    } catch (error) {
      console.error("Exception saving progress:", error);
    }
  };
  
  const handleCompletion = async () => {
    console.log("Handling podcast completion");
    await saveProgress(true);
    setShowXPModal(true);
  };
  
  // Set up progress saving interval
  useEffect(() => {
    // Clean up any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Only start a new interval if we're playing
    if (isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        saveProgress();
      }, 10000);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, podcastId]);

  return {
    showXPModal,
    setShowXPModal,
    saveProgress,
    handleCompletion
  };
}
