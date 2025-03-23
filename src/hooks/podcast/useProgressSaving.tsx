
import { supabase } from "@/lib/supabase";

// Add a completion threshold (e.g., 95% of the podcast duration)
const COMPLETION_THRESHOLD = 0.90;

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
      const duration = Math.floor(audioElement.duration || 0);
      
      // Only avoid saving if position is 0 and not completed
      if (last_position === 0 && !completed) {
        console.log("Position is zero, not saving progress");
        return;
      }
      
      // Calculate completion percentage
      const progressPercentage = duration > 0 ? (last_position / duration) * 100 : 0;
      // Mark as completed if explicitly set or if position is near end (90%)
      const isCompleted = completed || (duration > 0 && last_position >= duration * COMPLETION_THRESHOLD);
      
      console.log(`Saving progress for ${podcastId}: position=${last_position}/${duration} (${progressPercentage.toFixed(1)}%), completed=${isCompleted}`);
      
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
        const newlyCompleted = !existingRecord.completed && isCompleted;
        
        if (newlyCompleted) {
          console.log(`Podcast ${podcastId} being marked as completed for the first time!`);
        }
        
        const { data, error: updateError } = await supabase
          .from('user_progress')
          .update({
            last_position,
            duration, // Store the duration for future reference
            completed: isCompleted, // Set to true if it's completed now
            course_id: podcastCourseId,
            updated_at: timestamp
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId)
          .select();
        
        if (updateError) {
          console.error("Error updating progress:", updateError);
        } else {
          console.log(`Progress updated successfully, completed=${isCompleted}, timestamp: ${timestamp}`, data);
        }
      } 
      // Otherwise insert a new record
      else {
        const { data, error: insertError } = await supabase
          .from('user_progress')
          .insert([
            {
              user_id: userId,
              podcast_id: podcastId,
              last_position,
              duration,
              completed: isCompleted,
              course_id: podcastCourseId,
              updated_at: timestamp,
              created_at: timestamp
            }
          ])
          .select();
        
        if (insertError) {
          console.error("Error inserting progress:", insertError);
        } else {
          console.log(`Progress inserted successfully, completed=${isCompleted}, timestamp: ${timestamp}`, data);
        }
      }
    } catch (error) {
      console.error("Exception saving progress:", error);
    }
  };

  // Add a method to explicitly mark a podcast as completed
  const markAsCompleted = async () => {
    if (!podcastId) return false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("No active session, can't mark as completed");
        return false;
      }
      
      const userId = session.user.id;
      const timestamp = new Date().toISOString();
      
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('podcast_id', podcastId)
        .maybeSingle();
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            updated_at: timestamp
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId);
        
        if (error) {
          console.error("Error marking podcast as completed:", error);
          return false;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_progress')
          .insert([
            {
              user_id: userId,
              podcast_id: podcastId,
              last_position: 0,
              completed: true,
              course_id: podcastCourseId,
              updated_at: timestamp,
              created_at: timestamp
            }
          ]);
        
        if (error) {
          console.error("Error inserting completed podcast:", error);
          return false;
        }
      }
      
      console.log(`Podcast ${podcastId} marked as completed`);
      return true;
    } catch (error) {
      console.error("Exception marking podcast as completed:", error);
      return false;
    }
  };

  return {
    saveProgress,
    markAsCompleted
  };
}
