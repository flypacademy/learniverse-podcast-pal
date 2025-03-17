
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { fetchUserProgress, fetchCourseDetails, transformCourseData } from "@/utils/courseUtils";

export interface RecentCourse {
  id: string;
  title: string;
  subject: string;
  totalPodcasts: number;
  completedPodcasts: number;
  image: string;
  exam?: string;
  board?: string;
  achievements?: {
    type: "streak" | "popular" | "recommended" | "complete";
    value?: number;
  }[];
}

export function useRecentCourses() {
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRecentCourses = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No authenticated user found for recent courses");
          setLoading(false);
          return;
        }

        // Fetch user's course progress directly, including course_id
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('course_id, podcast_id, last_position, completed')
          .eq('user_id', session.user.id)
          .not('course_id', 'is', null)  // Ensure we only get records with course_id
          .order('updated_at', { ascending: false });
        
        if (progressError) {
          console.error("Error fetching user progress:", progressError);
          setLoading(false);
          return;
        }
        
        if (!progressData || progressData.length === 0) {
          console.log("No recent courses found");
          setLoading(false);
          return;
        }

        // Extract unique course IDs
        const uniqueCourseIds = [...new Set(
          progressData
            .filter(item => item.course_id)
            .map(item => item.course_id)
        )];

        if (uniqueCourseIds.length === 0) {
          console.log("No course IDs found in progress data");
          setLoading(false);
          return;
        }
        
        console.log("Found course IDs:", uniqueCourseIds);

        // Fetch detailed course information
        const coursesData = await fetchCourseDetails(uniqueCourseIds);
        
        if (!coursesData || coursesData.length === 0) {
          console.log("No course details found");
          setLoading(false);
          return;
        }

        // Transform courses data into the format needed by the UI
        const formattedCourses = await Promise.all(
          coursesData.map(course => transformCourseData(course, session.user.id))
        );

        setRecentCourses(formattedCourses);
        setLoading(false);
      } catch (error) {
        console.error("Error in useRecentCourses:", error);
        toast({
          title: "Error",
          description: "Failed to load your recent courses",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    loadRecentCourses();
  }, [toast]);

  return { recentCourses, loading };
}
