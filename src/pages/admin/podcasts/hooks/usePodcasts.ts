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
  headerId?: string | null;
  podcasts: Podcast[];
}

interface PodcastHeader {
  id: string;
  podcast_id: string;
  header_id: string;
  header_text?: string;
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
    const groupedPodcasts: Record<string, { podcasts: Podcast[], headerId?: string }> = {};
    const noHeaderKey = "no_header";
    
    const sortedPodcasts = [...podcastsList].sort((a, b) => {
      const orderA = a.display_order || 0;
      const orderB = b.display_order || 0;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      return a.title.localeCompare(b.title);
    });
    
    sortedPodcasts.forEach(podcast => {
      const key = podcast.header_text || noHeaderKey;
      if (!groupedPodcasts[key]) {
        groupedPodcasts[key] = { 
          podcasts: [], 
          headerId: podcast.course_header_id 
        };
      }
      groupedPodcasts[key].podcasts.push(podcast);
    });
    
    const sectionsArray: Section[] = [];
    
    if (groupedPodcasts[noHeaderKey]) {
      sectionsArray.push({
        header: null,
        podcasts: groupedPodcasts[noHeaderKey].podcasts
      });
      delete groupedPodcasts[noHeaderKey];
    }
    
    Object.entries(groupedPodcasts).forEach(([header, data]) => {
      sectionsArray.push({
        header,
        headerId: data.headerId,
        podcasts: data.podcasts
      });
    });
    
    return sectionsArray;
  };
  
  const fetchPodcasts = async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
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
      
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const { data: podcastHeadersData, error: podcastHeadersError } = await supabase
        .from('podcast_headers')
        .select('*, course_headers!inner(id, header_text)')
        .eq('course_headers.course_id', courseId);
      
      if (podcastHeadersError) {
        console.error("Error fetching podcast headers relationships:", podcastHeadersError);
      }
      
      console.log("Fetched podcast-header relationships:", podcastHeadersData);
      
      const podcastToHeaderMap: Record<string, { header_id: string, header_text: string }> = {};
      
      if (podcastHeadersData) {
        podcastHeadersData.forEach(ph => {
          const headerText = ph.course_headers?.header_text;
          if (headerText) {
            podcastToHeaderMap[ph.podcast_id] = {
              header_id: ph.header_id,
              header_text: headerText
            };
          }
        });
      }
      
      console.log("Podcast to header map:", podcastToHeaderMap);
      
      const processedPodcasts = (data || []).map(podcast => {
        const headerInfo = podcastToHeaderMap[podcast.id];
        
        return {
          ...podcast,
          header_text: headerInfo?.header_text || null,
          course_header_id: headerInfo?.header_id || null
        };
      });
      
      console.log("Processed podcasts with headers:", processedPodcasts);
      
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
  
  const assignPodcastToHeader = async (podcastId: string, headerId: string) => {
    try {
      console.log(`Assigning podcast ${podcastId} to header ${headerId}`);
      
      const { error: deleteError } = await supabase
        .from('podcast_headers')
        .delete()
        .eq('podcast_id', podcastId);
      
      if (deleteError) {
        console.error("Error removing existing podcast-header relationships:", deleteError);
        throw deleteError;
      }
      
      const { data, error } = await supabase
        .from('podcast_headers')
        .insert([
          {
            podcast_id: podcastId,
            header_id: headerId
          }
        ])
        .select();
      
      if (error) {
        console.error("Error assigning podcast to header:", error);
        throw error;
      }
      
      await fetchPodcasts();
      
      toast({
        title: "Podcast assigned",
        description: "Podcast has been assigned to the header"
      });
      
      return data;
    } catch (error: any) {
      console.error("Error in assignPodcastToHeader:", error);
      toast({
        title: "Error",
        description: "Failed to assign podcast to header",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteHeader = async (headerId: string) => {
    try {
      console.log(`Deleting header with ID: ${headerId}`);
      
      const { error: relationshipError } = await supabase
        .from('podcast_headers')
        .delete()
        .eq('header_id', headerId);
      
      if (relationshipError) {
        console.error("Error removing podcast-header relationships:", relationshipError);
        throw relationshipError;
      }
      
      const { error } = await supabase
        .from('course_headers')
        .delete()
        .eq('id', headerId);
      
      if (error) {
        console.error("Error deleting header:", error);
        throw error;
      }
      
      await fetchPodcasts();
      
      toast({
        title: "Header deleted",
        description: "The header has been successfully deleted"
      });
      
    } catch (error: any) {
      console.error("Error in deleteHeader:", error);
      toast({
        title: "Error",
        description: "Failed to delete header",
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
    addHeader,
    assignPodcastToHeader,
    deleteHeader
  };
};
