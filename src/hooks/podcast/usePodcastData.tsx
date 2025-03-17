
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { PodcastData, PodcastProgressData, CourseData } from "@/types/podcast";

export function usePodcastData() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  
  const fetchAttempted = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (loading && !podcastData) {
        console.error("Podcast loading timeout reached");
        setError("Loading timeout reached. Please try again later.");
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    timeoutRef.current = timeoutId;
    
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, podcastData]);
  
  const handleProgressData = (progressData: PodcastProgressData) => {
    // Only exposing the method, implementation will be in the audio player hook
    return { progressData };
  };
  
  const fetchPodcastData = useCallback(async () => {
    if (!podcastId) {
      setError("Invalid podcast ID");
      setLoading(false);
      return;
    }
    
    console.log("Fetching podcast data for ID:", podcastId);
    
    try {
      // Clear any previous timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      setLoading(true);
      setError(null);
      
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcasts')
        .select('*')
        .eq('id', podcastId)
        .maybeSingle();
      
      if (podcastError) {
        console.error("Supabase error fetching podcast:", podcastError);
        throw podcastError;
      }
      
      if (!podcastData) {
        console.error("Podcast not found with ID:", podcastId);
        throw new Error('Podcast not found');
      }
      
      console.log("Podcast data fetched successfully:", podcastData);
      
      // Validate that audio_url exists
      if (!podcastData.audio_url) {
        console.error("Podcast has no audio URL:", podcastId);
        throw new Error('Podcast audio not available');
      }
      
      setPodcastData(podcastData);
      
      if (podcastData.course_id) {
        console.log("Fetching course data for course ID:", podcastData.course_id);
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title, image_url')
          .eq('id', podcastData.course_id)
          .maybeSingle();
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
        } else if (courseData) {
          console.log("Course data fetched:", courseData);
          const formattedCourseData: CourseData = {
            id: courseData.id,
            title: courseData.title,
            image: courseData.image_url
          };
          setCourseData(formattedCourseData);
        }
      }
      
      try {
        const { count, error: quizError } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('podcast_id', podcastId);
        
        if (quizError) {
          console.error("Error checking quiz:", quizError);
        } else {
          setIsQuizAvailable(!!count && count > 0);
        }
      } catch (error) {
        console.error("Error checking quiz availability:", error);
      }
      
    } catch (error: any) {
      console.error("Error in fetchPodcastData:", error);
      setError(error.message || "Failed to load podcast");
      toast({
        title: "Error",
        description: "Failed to load podcast: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    } finally {
      console.log("Finished loading podcast data");
      setLoading(false);
      fetchAttempted.current = true;
    }
  }, [podcastId, toast]);
  
  const refetchPodcastData = useCallback(() => {
    fetchAttempted.current = false;
    fetchPodcastData();
  }, [fetchPodcastData]);
  
  useEffect(() => {
    if (!fetchAttempted.current) {
      fetchPodcastData();
    }
  }, [fetchPodcastData]);
  
  return {
    podcastId,
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable,
    handleProgressData,
    refetchPodcastData
  };
}
