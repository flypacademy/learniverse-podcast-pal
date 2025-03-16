
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
  header_text?: string | null;
  display_order?: number;
}

interface Section {
  header: string | null;
  podcasts: Podcast[];
}

export const usePodcasts = (courseId: string | undefined) => {
  const { toast } = useToast();
  const [courseName, setCourseName] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
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
  
  const organizePodcastsByHeader = (podcastsList: Podcast[]) => {
    // Group podcasts by header_text
    const groupedPodcasts: Record<string, Podcast[]> = {};
    const noHeaderKey = "no_header";
    
    // Sort podcasts by display_order first, then by title
    const sortedPodcasts = [...podcastsList].sort((a, b) => {
      const orderA = a.display_order || 0;
      const orderB = b.display_order || 0;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      return a.title.localeCompare(b.title);
    });
    
    // Group podcasts by header
    sortedPodcasts.forEach(podcast => {
      const key = podcast.header_text || noHeaderKey;
      if (!groupedPodcasts[key]) {
        groupedPodcasts[key] = [];
      }
      groupedPodcasts[key].push(podcast);
    });
    
    // Convert grouped podcasts to sections array
    const sectionsArray: Section[] = [];
    
    // Add podcasts with no header first if they exist
    if (groupedPodcasts[noHeaderKey]) {
      sectionsArray.push({
        header: null,
        podcasts: groupedPodcasts[noHeaderKey]
      });
      delete groupedPodcasts[noHeaderKey];
    }
    
    // Add the rest of the sections
    Object.entries(groupedPodcasts).forEach(([header, podcastList]) => {
      sectionsArray.push({
        header,
        podcasts: podcastList
      });
    });
    
    return sectionsArray;
  };
  
  const fetchPodcasts = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*, course_headers(header_text)')
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
            question_count: count || 0,
            header_text: podcast.course_headers?.header_text || null
          };
        })
      );
      
      setPodcasts(podcastsWithQuizCount);
      setSections(organizePodcastsByHeader(podcastsWithQuizCount));
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
      
      const updatedPodcasts = podcasts.filter(podcast => podcast.id !== id);
      setPodcasts(updatedPodcasts);
      setSections(organizePodcastsByHeader(updatedPodcasts));
      
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
  
  const addHeader = async (headerText: string) => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from('course_headers')
        .insert([
          { course_id: courseId, header_text: headerText }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // After adding the header, refresh the podcasts to update the UI
      await fetchPodcasts();
      
      toast({
        title: "Header added",
        description: "The header has been successfully added"
      });
      
      return data;
    } catch (error) {
      console.error("Error adding header:", error);
      toast({
        title: "Error",
        description: "Failed to add header",
        variant: "destructive"
      });
      throw error;
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
    sections,
    loading,
    deletePodcast,
    addHeader
  };
};
