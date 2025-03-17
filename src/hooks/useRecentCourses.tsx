
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

        // Fetch user's course progress
        const progressData = await fetchUserProgress(session.user.id);
        
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
          setLoading(false);
          return;
        }

        // Fetch detailed course information
        const coursesData = await fetchCourseDetails(uniqueCourseIds);
        
        if (!coursesData || coursesData.length === 0) {
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
