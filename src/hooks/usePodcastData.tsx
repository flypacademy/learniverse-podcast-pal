
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { PodcastData, CourseData, PodcastProgressData } from "@/types/podcast";

export function usePodcastData(podcastId: string | undefined) {
  const { toast } = useToast();
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [initialPosition, setInitialPosition] = useState(0);

  useEffect(() => {
    if (!podcastId) {
      console.error("No podcastId provided");
      setError("No podcast ID found");
      setLoading(false);
      return;
    }

    async function fetchPodcastData() {
      console.log("Fetching podcast data for ID:", podcastId);
      
      try {
        // Fetch podcast data with timeout handling
        const podcastPromise = supabase
          .from('podcasts')
          .select('*')
          .eq('id', podcastId)
          .single();
          
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Podcast fetch timed out")), 10000)
        );
        
        const { data: podcastData, error: podcastError } = await Promise.race([
          podcastPromise,
          timeoutPromise
        ]) as any;
        
        if (podcastError) {
          console.error("Error fetching podcast:", podcastError);
          throw podcastError;
        }
        
        if (!podcastData) {
          console.error("Podcast not found");
          throw new Error('Podcast not found');
        }
        
        console.log("Podcast data fetched successfully:", podcastData);
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
            console.log("Course data fetched successfully:", courseData);
            const formattedCourseData: CourseData = {
              id: courseData.id,
              title: courseData.title,
              image: courseData.image_url
            };
            setCourseData(formattedCourseData);
          }
        }
        
        // Check if quiz is available
        const { count, error: quizError } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('podcast_id', podcastId);
        
        if (quizError) {
          console.error("Error checking quiz:", quizError);
        } else {
          console.log("Quiz questions count:", count);
          setIsQuizAvailable(!!count && count > 0);
        }
        
        // Get user progress if logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("User session found, fetching progress data");
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('last_position, completed')
            .eq('podcast_id', podcastId)
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (progressData) {
            console.log("Progress data found:", progressData);
            setInitialPosition(progressData.last_position || 0);
          }
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
        setLoading(false);
      }
    }
    
    fetchPodcastData();
  }, [podcastId, toast]);

  return {
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable,
    initialPosition
  };
}
