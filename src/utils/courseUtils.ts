
import { supabase } from "@/lib/supabase";
import { RecentCourse } from "@/hooks/useRecentCourses";

/**
 * Fetches user progress data from Supabase
 */
export async function fetchUserProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('course_id, podcast_id, last_position, completed')
    .eq('user_id', userId)
    .not('course_id', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching user progress:", error);
    return [];
  }

  return data;
}

/**
 * Fetches course details for the given course IDs
 */
export async function fetchCourseDetails(courseIds: string[]) {
  if (courseIds.length === 0) {
    console.log("No course IDs provided to fetchCourseDetails");
    return [];
  }
  
  console.log("Fetching details for courses:", courseIds);
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)
    .limit(3); // Limit to 3 recent courses

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data;
}

/**
 * Counts total podcasts for a course
 */
export async function countTotalPodcasts(courseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('podcasts')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (error) {
    console.error(`Error counting podcasts for course ${courseId}:`, error);
    return 0;
  }

  return count || 0;
}

/**
 * Counts completed podcasts for a user and course
 */
export async function countCompletedPodcasts(userId: string, courseId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('completed', true);

  if (error) {
    console.error(`Error counting completed podcasts for course ${courseId}:`, error);
    return 0;
  }

  return count || 0;
}

/**
 * Generates achievements based on course completion
 */
export function generateAchievements(completionPercentage: number): RecentCourse['achievements'] {
  const achievements = [];
  
  if (completionPercentage >= 0.8) {
    achievements.push({ type: "complete" as const });
  }
  
  return achievements;
}

/**
 * Transforms raw course data into the format needed by the UI
 */
export async function transformCourseData(course: any, userId: string): Promise<RecentCourse> {
  // Get total podcasts for this course
  const totalPodcasts = await countTotalPodcasts(course.id);
  
  // Count completed podcasts for this user and course
  const completedPodcasts = await countCompletedPodcasts(userId, course.id);
  
  // Calculate completion percentage for achievements
  const completionPercentage = totalPodcasts ? completedPodcasts / totalPodcasts : 0;
  
  // Format achievements based on user progress
  const achievements = generateAchievements(completionPercentage);

  return {
    id: course.id,
    title: course.title,
    subject: course.subject || "math",
    totalPodcasts: totalPodcasts,
    completedPodcasts: completedPodcasts,
    image: course.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
    exam: course.exam || "GCSE",
    board: course.board || "AQA",
    achievements
  };
}
