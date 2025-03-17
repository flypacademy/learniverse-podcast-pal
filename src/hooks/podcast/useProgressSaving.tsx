
import { supabase } from "@/lib/supabase";

export function useProgressSaving(podcastId: string | undefined, podcastCourseId?: string) {
  const saveProgress = async (audioElement: HTMLAudioElement | null, completed = false) => {
    if (!audioElement || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const userId = session.user.id;
      const last_position = Math.floor(audioElement.currentTime);
      
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

  return {
    saveProgress
  };
}
