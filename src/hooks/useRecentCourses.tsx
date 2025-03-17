
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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
    const fetchRecentCourses = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No authenticated user found for recent courses");
          setLoading(false);
          return;
        }

        // Get the user's progress data to find courses they've interacted with
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('course_id, podcast_id, last_position, completed')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (progressError) {
          console.error("Error fetching user progress:", progressError);
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
          console.log("No recent courses found");
          setLoading(false);
          return;
        }

        // Fetch course details
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', uniqueCourseIds)
          .limit(3); // Limit to 3 recent courses

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setLoading(false);
          return;
        }

        // For each course, fetch the number of podcasts and user's completed podcasts
        const formattedCourses = await Promise.all(coursesData.map(async (course) => {
          // Get total podcasts for this course
          const { count: totalPodcasts, error: podcastsError } = await supabase
            .from('podcasts')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          if (podcastsError) {
            console.error(`Error counting podcasts for course ${course.id}:`, podcastsError);
          }

          // Count completed podcasts for this user and course
          const { count: completedPodcasts, error: completedError } = await supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('course_id', course.id)
            .eq('completed', true);

          if (completedError) {
            console.error(`Error counting completed podcasts for course ${course.id}:`, completedError);
          }

          // Format achievements based on user progress
          const achievements = [];
          
          // Check if user has a streak
          const userHasStreak = false; // This would require streak tracking logic
          if (userHasStreak) {
            achievements.push({ type: "streak" as const, value: 3 });
          }
          
          // Check completion percentage for course achievement
          const completionPercentage = totalPodcasts ? (completedPodcasts || 0) / totalPodcasts : 0;
          if (completionPercentage >= 0.8) {
            achievements.push({ type: "complete" as const });
          }

          return {
            id: course.id,
            title: course.title,
            subject: course.subject || "math",
            totalPodcasts: totalPodcasts || 0,
            completedPodcasts: completedPodcasts || 0,
            image: course.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
            exam: course.exam || "GCSE",
            board: course.board || "AQA",
            achievements
          };
        }));

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

    fetchRecentCourses();
  }, [toast]);

  return { recentCourses, loading };
}
