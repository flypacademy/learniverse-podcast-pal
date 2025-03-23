
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  exam?: string;
  board?: string;
  podcasts: Podcast[];
}

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

export const useCourseDetail = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("CourseDetail - courseId from params:", courseId);
    if (!courseId) {
      setLoading(false);
      setError("Course ID is missing");
      return;
    }

    async function fetchCourseDetails() {
      try {
        console.log("fetchCourseDetails called with courseId:", courseId);
        setLoading(true);
        setError(null);

        // Fetch the course data
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) {
          throw courseError;
        }

        if (!courseData) {
          throw new Error("Course not found");
        }

        console.log("Course data fetched successfully:", courseData);

        // Fetch the podcasts for this course
        const { data: podcastsData, error: podcastsError } = await supabase
          .from("podcasts")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: true });

        if (podcastsError) {
          throw podcastsError;
        }

        // Fetch course headers to organize podcasts
        const { data: headersData, error: headersError } = await supabase
          .from("course_headers")
          .select("*")
          .eq("course_id", courseId);

        if (headersError) {
          console.error("Error fetching headers:", headersError);
          // Continue even if headers fetch fails
        }

        const headers = headersData || [];
        console.log("Fetched headers:", headers);

        // Fetch podcast-header relationships
        const { data: podcastHeadersData, error: relationshipsError } = await supabase
          .from("podcast_headers")
          .select("podcast_id, header_id, course_headers(id, header_text)")
          .eq("course_headers.course_id", courseId);

        if (relationshipsError) {
          console.error("Error fetching podcast-header relationships:", relationshipsError);
          // Continue even if relationships fetch fails
        }

        // Create a map from podcast ID to header text
        const podcastToHeader: Record<string, string> = {};

        if (podcastHeadersData) {
          podcastHeadersData.forEach((ph: any) => {
            if (ph.course_headers && ph.course_headers.header_text) {
              podcastToHeader[ph.podcast_id] = ph.course_headers.header_text;
            }
          });
        }

        console.log("Podcast to header map:", podcastToHeader);

        // Get the current user's session
        const { data: { session } } = await supabase.auth.getSession();
        let userProgress: any[] = [];

        if (session) {
          // Fetch user progress for the podcasts in this course with a more detailed select
          const { data: progressData, error: progressError } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("course_id", courseId);

          if (progressError) {
            console.error("Error fetching user progress:", progressError);
          } else {
            userProgress = progressData || [];
            console.log("User progress data:", userProgress);
            
            // Explicitly log the completion status of all podcasts in progress data
            console.log("Raw completion status for all podcasts:");
            userProgress.forEach(progress => {
              console.log(`Podcast ${progress.podcast_id}: completed=${progress.completed}, completedType=${typeof progress.completed}, updated=${progress.updated_at}`);
            });
          }
        }

        // Create a map for quick lookup of user progress with more details for debugging
        const progressMap: Record<string, { position: number; completed: boolean, duration?: number, updatedAt?: string }> = {};
        userProgress.forEach((progress) => {
          // Ensure completed is a strict boolean value
          const isCompleted = progress.completed === true;
          
          progressMap[progress.podcast_id] = {
            position: progress.last_position || 0,
            completed: isCompleted,
            duration: progress.duration,
            updatedAt: progress.updated_at
          };
          
          // Log individual progress records with explicit type checking
          console.log(`Progress for podcast ${progress.podcast_id}: position=${progress.last_position}, completed=${isCompleted}, completedType=${typeof isCompleted}, updatedAt=${progress.updated_at}`);
        });

        // Transform podcast data to include progress and header info
        const processedPodcasts = podcastsData.map((podcast: any) => {
          const progress = progressMap[podcast.id] || { position: 0, completed: false };
          const podcastProgress = podcast.duration ? (progress.position / podcast.duration) * 100 : 0;
          
          // Ensure completed is a boolean with explicit type check
          const isCompleted = progress.completed === true;
          
          // Log detailed completion info about each podcast
          console.log(`Processing podcast ${podcast.id} "${podcast.title}": ${isCompleted ? "COMPLETED" : "not completed"} (${progress.position}/${podcast.duration} = ${podcastProgress.toFixed(1)}%) updated: ${progress.updatedAt || 'N/A'}`);
          
          return {
            id: podcast.id,
            title: podcast.title,
            courseId: courseId,
            courseName: courseData.title,
            duration: podcast.duration || 0,
            progress: podcastProgress,
            completed: isCompleted, // Use the strictly-checked boolean
            image: podcast.image_url || courseData.image_url,
            header_text: podcastToHeader[podcast.id] || null,
          };
        });

        // Calculate total and completed podcasts
        const totalPodcasts = processedPodcasts.length;
        const completedPodcasts = processedPodcasts.filter(p => p.completed === true).length;
        const totalDuration = processedPodcasts.reduce((sum, p) => sum + (p.duration || 0), 0);

        // Construct the final course object
        const courseWithPodcasts: Course = {
          id: courseData.id,
          title: courseData.title,
          subject: courseData.subject || "math",
          description: courseData.description || "",
          totalPodcasts,
          completedPodcasts,
          totalDuration,
          difficulty: totalDuration < 600 ? "Beginner" : totalDuration < 1800 ? "Intermediate" : "Advanced",
          image: courseData.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
          exam: courseData.exam || "GCSE",
          board: courseData.board || "AQA",
          podcasts: processedPodcasts,
        };

        setCourse(courseWithPodcasts);
      } catch (err: any) {
        console.error("Error in fetchCourseDetails:", err);
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

  console.log("Hook results - course:", course, "loading:", loading, "error:", error);

  return { course, loading, error };
};
