
import { supabase } from "@/lib/supabase";

export function useProgressSaving(podcastId: string | undefined, podcastCourseId?: string) {
  const saveProgress = async (audioElement: HTMLAudioElement | null, completed = false) => {
    if (!audioElement || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("No active session, can't save progress");
        return;
      }
      
      const userId = session.user.id;
      const last_position = Math.floor(audioElement.currentTime);
      
      // Reduced threshold to capture even small amounts of listening time
      // Only avoid saving if position is 0 and not completed
      if (last_position === 0 && !completed) {
        console.log("Position is zero, not saving progress");
        return;
      }
      
      console.log("Saving progress with data:", {
        user_id: userId,
        podcast_id: podcastId,
        last_position,
        completed,
        course_id: podcastCourseId
      });
      
      // First check if a record already exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('podcast_id', podcastId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error checking existing progress:", fetchError);
        return;
      }
      
      // Force the updated_at to be now to ensure we always update the timestamp
      const timestamp = new Date().toISOString();
      
      // If record exists, update it
      if (existingRecord) {
        // Check if we're newly completing the podcast
        const newlyCompleted = !existingRecord.completed && completed;
        
        if (newlyCompleted) {
          console.log("Podcast being marked as completed for the first time");
        }
        
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            last_position: last_position,
            completed: completed || existingRecord.completed, // Keep as completed if it was already completed
            course_id: podcastCourseId,
            updated_at: timestamp
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId);
        
        if (updateError) {
          console.error("Error updating progress:", updateError);
        } else {
          console.log("Progress updated successfully with timestamp:", timestamp);
        }
      } 
      // Otherwise insert a new record
      else {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert([
            {
              user_id: userId,
              podcast_id: podcastId,
              last_position: last_position,
              completed: completed,
              course_id: podcastCourseId,
              updated_at: timestamp,
              created_at: timestamp
            }
          ]);
        
        if (insertError) {
          console.error("Error inserting progress:", insertError);
        } else {
          console.log("Progress inserted successfully with timestamp:", timestamp);
        }
      }
    } catch (error) {
      console.error("Exception saving progress:", error);
    }
  };

  return {
    saveProgress
  };
}
