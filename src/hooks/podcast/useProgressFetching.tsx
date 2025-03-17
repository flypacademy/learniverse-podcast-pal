
import { supabase } from "@/lib/supabase";
import { PodcastProgressData } from "@/types/podcast";

export function useProgressFetching(podcastId: string | undefined) {
  const fetchUserProgress = async (): Promise<PodcastProgressData | null> => {
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
    fetchUserProgress
  };
}
