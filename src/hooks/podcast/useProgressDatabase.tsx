
import { supabase } from "@/lib/supabase";
import { PodcastProgressData } from "@/types/podcast";

export function useProgressDatabase() {
  // Save current progress to database
  const saveProgressToDatabase = async (
    userId: string,
    podcastId: string,
    last_position: number,
    isCompleted: boolean,
    courseId?: string
  ) => {
    try {
      console.log("Saving progress to database:", {
        podcastId,
        position: last_position,
        completed: isCompleted,
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
        // Only track if this is the first time we're marking it complete
        const shouldAwardCompletionXP = !existingRecord.completed && isCompleted;
        
        // Update existing record
        await supabase
          .from('user_progress')
          .update({
            last_position,
            completed: isCompleted || existingRecord.completed,
            course_id: courseId,
            updated_at: timestamp
          })
          .eq('user_id', userId)
          .eq('podcast_id', podcastId);
          
        return { updated: true, shouldAwardCompletionXP };
      } else {
        // Insert new record
        await supabase
          .from('user_progress')
          .insert([
            {
              user_id: userId,
              podcast_id: podcastId,
              last_position,
              completed: isCompleted,
              course_id: courseId,
              updated_at: timestamp,
              created_at: timestamp
            }
          ]);
          
        return { updated: true, shouldAwardCompletionXP: isCompleted };
      }
    } catch (error) {
      console.error("Error saving progress to database:", error);
      return { updated: false, shouldAwardCompletionXP: false };
    }
  };
  
  // Fetch user progress
  const fetchProgressFromDatabase = async (
    userId: string,
    podcastId: string
  ): Promise<PodcastProgressData | null> => {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('last_position, completed')
        .eq('podcast_id', podcastId)
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log("Fetched progress data for podcast", podcastId, data);
      return data;
    } catch (error) {
      console.error("Error fetching progress from database:", error);
      return null;
    }
  };
  
  return {
    saveProgressToDatabase,
    fetchProgressFromDatabase
  };
}
