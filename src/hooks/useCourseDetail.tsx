
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Podcast {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number;
  progress: number;
  completed: boolean;
  image: string;
  header_text?: string | null;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  totalPodcasts: number;
  completedPodcasts: number;
  totalDuration: number;
  difficulty: string;
  image: string;
  podcasts: Podcast[];
  exam?: string;
  board?: string;
}

interface UseCourseDetailResult {
  course: Course | null;
  loading: boolean;
  error: string | null;
}

export const useCourseDetail = (courseId: string | undefined): UseCourseDetailResult => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Reset state when courseId changes
    setLoading(true);
    setError(null);
    setCourse(null);
    
    const fetchCourseDetails = async () => {
      try {
        console.log("fetchCourseDetails called with courseId:", courseId);
        
        // Check if courseId exists and is not empty
        if (!courseId) {
          console.error("No courseId provided");
          setError("No course ID provided");
          setLoading(false);
          return;
        }
        
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          setError(`Failed to load course: ${courseError.message}`);
          setLoading(false);
          return;
        }
        
        if (!courseData) {
          console.log("No course found with ID:", courseId);
          setLoading(false);
          return; // Don't set an error, let the component handle this case
        }
        
        console.log("Course data fetched successfully:", courseData);
        
        // Fetch course headers
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
        
        // Fetch podcasts data
        const { data: podcastsData, error: podcastsError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('course_id', courseId);
        
        if (podcastsError) {
          console.error("Error fetching podcasts:", podcastsError);
          setError(`Failed to load podcasts: ${podcastsError.message}`);
          setLoading(false);
          return;
        }
        
        const podcasts = podcastsData || [];
        
        // Calculate total duration
        const totalDuration = podcasts.reduce((sum, podcast) => {
          return sum + (podcast.duration || 0);
        }, 0);
        
        // Assign headers to podcasts
        // For now, assign all podcasts to the first header if one exists
        const firstHeader = headers.length > 0 ? headers[0] : null;
        
        // Format course data
        const formattedCourse: Course = {
          id: courseData.id,
          title: courseData.title,
          subject: courseData.subject || "math", // Default to math if subject not specified
          description: courseData.description || "No description available",
          totalPodcasts: podcasts.length,
          completedPodcasts: 0,
          totalDuration: totalDuration,
          difficulty: courseData.difficulty || "Intermediate",
          image: courseData.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
          exam: courseData.exam || "GCSE",
          board: courseData.board || "AQA",
          podcasts: podcasts.map(podcast => ({
            id: podcast.id,
            title: podcast.title || "Untitled Podcast",
            courseId: podcast.course_id,
            courseName: courseData.title,
            duration: podcast.duration || 0,
            progress: 0,
            completed: false,
            image: podcast.image_url || courseData.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
            header_text: firstHeader ? firstHeader.header_text : null
          }))
        };
        
        setCourse(formattedCourse);
        setLoading(false);
      } catch (err: any) {
        console.error("Unexpected error in fetchCourseDetails:", err);
        setError(err.message || "An unexpected error occurred");
        setLoading(false);
        toast({
          title: "Error",
          description: err.message || "Failed to load course details",
          variant: "destructive"
        });
      }
    };
    
    fetchCourseDetails();
  }, [courseId, toast]);
  
  return { course, loading, error };
};
