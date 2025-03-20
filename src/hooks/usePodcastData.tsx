
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PodcastData, CourseData } from "@/types/podcast";

export function usePodcastData() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!podcastId) {
        setError("Invalid podcast ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching podcast data for ID:", podcastId);

        // Fetch podcast data
        const { data: podcast, error: podcastError } = await supabase
          .from("podcasts")
          .select("*")
          .eq("id", podcastId)
          .maybeSingle();

        if (podcastError) throw podcastError;
        if (!podcast) throw new Error("Podcast not found");
        if (!podcast.audio_url) throw new Error("Podcast has no audio URL");

        console.log("Podcast data loaded:", podcast);
        setPodcastData(podcast);

        // Fetch course data if podcast has course_id
        if (podcast.course_id) {
          const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("id, title, image_url")
            .eq("id", podcast.course_id)
            .maybeSingle();

          if (!courseError && course) {
            setCourseData({
              id: course.id,
              title: course.title,
              image: course.image_url
            });
          }
        }

        // Check if quiz is available
        const { count } = await supabase
          .from("quiz_questions")
          .select("id", { count: "exact", head: true })
          .eq("podcast_id", podcastId);

        setIsQuizAvailable(!!count && count > 0);

      } catch (err: any) {
        console.error("Error fetching podcast data:", err);
        setError(err.message || "Failed to load podcast");
        toast.error(`Failed to load podcast: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [podcastId]);

  return {
    podcastId,
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable
  };
}
