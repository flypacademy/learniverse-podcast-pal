
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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
  course_header_id?: string | null;
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
  const [error, setError] = useState<string | null>(null);
  
  const fetchCourse = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setCourseName(data.title);
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      setError("Failed to load course data");
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
    setError(null);
    
    try {
      // First fetch course headers for this course
      const { data: headersData, error: headersError } = await supabase
        .from('course_headers')
        .select('*')
        .eq('course_id', courseId)
        .order('display_order', { ascending: true });
      
      if (headersError) {
        console.error("Error fetching headers:", headersError);
        // Continue even if headers fetch fails
      }
      
      const headers = headersData || [];
      console.log("Fetched headers:", headers);
      
      // Now fetch podcasts
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process podcasts - IMPORTANT: For now, assign all podcasts to the first header
      // In a real implementation, you would have a separate table linking podcasts to headers
      const processedPodcasts = (data || []).map(podcast => {
        if (headers.length === 0) {
          return {
            ...podcast,
            header_text: null,
            course_header_id: null
          };
        }
        
        // For this implementation, let's use only the first header
        // In a real app, this would be determined by a podcast_header relationship table
        const header = headers[0];
        
        return {
          ...podcast,
          header_text: header.header_text,
          course_header_id: header.id
        };
      });
      
      console.log("Processed podcasts with headers:", processedPodcasts);
      
      // Count quiz questions for each podcast
      const podcastsWithQuizCount = await Promise.all(
        processedPodcasts.map(async (podcast) => {
          try {
            const { count } = await supabase
              .from('quiz_questions')
              .select('id', { count: 'exact', head: true })
              .eq('podcast_id', podcast.id);
            
            return {
              ...podcast,
              question_count: count || 0
            };
          } catch (error) {
            console.error(`Error counting questions for podcast ${podcast.id}:`, error);
            return {
              ...podcast,
              question_count: 0
            };
          }
        })
      );
      
      setPodcasts(podcastsWithQuizCount);
      const organizedSections = organizePodcastsByHeader(podcastsWithQuizCount);
      console.log("Organized sections:", organizedSections);
      setSections(organizedSections);
    } catch (error: any) {
      console.error("Error fetching podcasts:", error);
      setError("Failed to load podcasts");
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
    } catch (error: any) {
      console.error("Error deleting podcast:", error);
      toast({
        title: "Error",
        description: "Failed to delete podcast",
        variant: "destructive"
      });
    }
  };
  
  const addHeader = async (headerText: string) => {
    if (!courseId) {
      const errorMsg = "Course ID is missing";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }
    
    try {
      console.log("Adding header with text:", headerText, "for course:", courseId);
      
      // Validate header text before submission
      if (!headerText || typeof headerText !== 'string' || headerText.trim() === '') {
        const errorMsg = "Header text cannot be empty";
        console.error(errorMsg);
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      // Insert the new header into the course_headers table
      const { data, error } = await supabase
        .from('course_headers')
        .insert([
          { 
            course_id: courseId, 
            header_text: headerText.trim() 
          }
        ])
        .select();
      
      if (error) {
        console.error("Error inserting header:", error);
        const errorMsg = `Failed to add header: ${error.message}`;
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      if (!data || data.length === 0) {
        const errorMsg = "No data returned after adding header";
        console.error(errorMsg);
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
      
      console.log("Header added successfully:", data[0]);
      
      // After adding the header, refresh the podcasts to update the UI
      await fetchPodcasts();
      
      toast({
        title: "Header added",
        description: "The header has been successfully added"
      });
      
      return data[0];
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error occurred";
      console.error("Error adding header:", errorMsg);
      setError(`Failed to add header: ${errorMsg}`);
      toast({
        title: "Error",
        description: `Failed to add header: ${errorMsg}`,
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
    error,
    deletePodcast,
    addHeader
  };
};
