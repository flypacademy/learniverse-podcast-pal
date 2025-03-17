
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useProgressTracking(
  podcastId: string | undefined, 
  audioRef: React.RefObject<HTMLAudioElement>,
  isPlaying: boolean,
  podcastCourseId?: string
) {
  const saveProgress = async (completed = false) => {
    if (!audioRef.current || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const userId = session.user.id;
      const last_position = Math.floor(audioRef.current.currentTime);
      
      // Log the data being saved to help debug
      console.log("Saving progress with data:", {
        user_id: userId,
        podcast_id: podcastId,
        last_position,
        completed,
        course_id: podcastCourseId
      });
      
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: userId,
            podcast_id: podcastId,
            last_position: last_position,
            completed: completed,
            course_id: podcastCourseId
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
  
  // Save progress periodically while playing
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying) {
        saveProgress();
      }
    }, 10000); // Save every 10 seconds while playing
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, podcastId, podcastCourseId]);
  
  const handleCompletion = async () => {
    await saveProgress(true);
    return true; // Signal completion was successful
  };
  
  const fetchUserProgress = async () => {
    if (!podcastId) return null;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('last_position, completed')
        .eq('podcast_id', podcastId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user progress:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Exception fetching user progress:", error);
      return null;
    }
  };
  
  return {
    saveProgress,
    handleCompletion,
    fetchUserProgress
  };
}
