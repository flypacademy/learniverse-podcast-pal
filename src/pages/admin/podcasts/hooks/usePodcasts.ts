
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Podcast {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string | null;
  created_at: string;
  question_count?: number;
}

export const usePodcasts = (courseId: string | undefined) => {
  const { toast } = useToast();
  const [courseName, setCourseName] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCourse = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCourseName(data.title);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive"
      });
    }
  };
  
  const fetchPodcasts = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const podcastsWithQuizCount = await Promise.all(
        (data || []).map(async (podcast) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('podcast_id', podcast.id);
          
          return {
            ...podcast,
            question_count: count || 0
          };
        })
      );
      
      setPodcasts(podcastsWithQuizCount);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
      toast({
        title: "Error",
        description: "Failed to load podcasts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deletePodcast = async (id: string) => {
    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPodcasts(podcasts.filter(podcast => podcast.id !== id));
      
      toast({
        title: "Podcast deleted",
        description: "The podcast has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting podcast:", error);
      toast({
        title: "Error",
        description: "Failed to delete podcast",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchPodcasts();
    }
  }, [courseId]);
  
  return {
    courseName,
    podcasts,
    loading,
    deletePodcast
  };
};
