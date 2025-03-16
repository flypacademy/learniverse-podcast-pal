
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
    const fetchCourseDetails = async () => {
      try {
        if (!courseId) {
          setError("No course ID provided");
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        console.log("Fetching course details for:", courseId);
        
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId);
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          setError(`Failed to load course: ${courseError.message}`);
          setLoading(false);
          return;
        }
        
        if (!courseData || courseData.length === 0) {
          console.log("No course found with ID:", courseId);
          setError("Course not found");
          setLoading(false);
          return;
        }
        
        const courseItem = courseData[0];
        console.log("Course data fetched:", courseItem);
        
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
        console.log("Podcasts data fetched:", podcasts);
        
        // Calculate total duration
        const totalDuration = podcasts.reduce((sum, podcast) => {
          return sum + (podcast.duration || 0);
        }, 0);
        
        // Format course data
        const formattedCourse: Course = {
          id: courseItem.id,
          title: courseItem.title,
          subject: courseItem.subject || "math",
          description: courseItem.description || "No description available",
          totalPodcasts: podcasts.length,
          completedPodcasts: 0,
          totalDuration: totalDuration,
          difficulty: courseItem.difficulty || "Intermediate",
          image: courseItem.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
          exam: courseItem.exam || "GCSE",
          board: courseItem.board || "AQA",
          podcasts: podcasts.map(podcast => ({
            id: podcast.id,
            title: podcast.title || "Untitled Podcast",
            courseId: podcast.course_id,
            courseName: courseItem.title,
            duration: podcast.duration || 0,
            progress: 0,
            completed: false,
            image: podcast.image_url || courseItem.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
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
