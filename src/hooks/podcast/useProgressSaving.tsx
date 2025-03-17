
import { supabase } from "@/lib/supabase";

export function useProgressSaving(podcastId: string | undefined, podcastCourseId?: string) {
  const saveProgress = async (audioElement: HTMLAudioElement | null, completed = false) => {
    if (!audioElement || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const userId = session.user.id;
      const last_position = Math.floor(audioElement.currentTime);
      
      // Only save progress if we have a meaningful position
      if (last_position <= 0 && !completed) return;
      
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
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error checking existing progress:", fetchError);
        return;
      }
      
      // If record exists, update it
      if (existingRecord) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            last_position: last_position,
            completed: completed,
            course_id: podcastCourseId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId);
        
        if (updateError) {
          console.error("Error updating progress:", updateError);
        } else {
          console.log("Progress updated successfully");
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
              course_id: podcastCourseId
            }
          ]);
        
        if (insertError) {
          console.error("Error inserting progress:", insertError);
        } else {
          console.log("Progress inserted successfully");
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
