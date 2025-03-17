
import { useState, useRef, useEffect } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { useToast } from "@/components/ui/use-toast";
import { PodcastData, CourseData } from "@/types/podcast";

interface UseAudioInitializationProps {
  podcastId: string | undefined;
  podcastData: PodcastData | null;
  courseData: CourseData | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  loading: boolean;
}

export function useAudioInitialization({
  podcastId,
  podcastData,
  courseData,
  audioRef,
  loading
}: UseAudioInitializationProps) {
  const { toast } = useToast();
  const audioStore = useAudioStore();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const initializationAttemptedRef = useRef(false);

  // Save podcast metadata to the global store when it's loaded
  useEffect(() => {
    if (podcastData && courseData && !loading) {
      audioStore.setPodcastMeta({
        id: podcastData.id,
        title: podcastData.title,
        courseName: courseData?.title || "Unknown Course",
        image: podcastData.image_url || undefined
      });
    }
  }, [podcastData, courseData, loading, audioStore]);

  // Create and configure audio element when podcast data is loaded
  useEffect(() => {
    if (podcastData?.audio_url && audioRef.current && !initializationAttemptedRef.current) {
      initializationAttemptedRef.current = true;
      
      try {
        console.log("Configuring audio element with URL:", podcastData.audio_url);
        
        // Register with audio store first before manipulating the audio element
        if (podcastId) {
          audioStore.setAudio(audioRef.current, podcastId, {
            id: podcastData.id,
            title: podcastData.title,
            courseName: courseData?.title || "Unknown Course",
            image: podcastData.image_url || undefined
          });
          
          // Delay setting audioInitialized to avoid immediate re-renders
          setTimeout(() => {
            setAudioInitialized(true);
          }, 0);
        }
      } catch (error) {
        console.error("Error initializing audio:", error);
        toast({
          title: "Error",
          description: "Failed to initialize audio player",
          variant: "destructive"
        });
      }
    }
  }, [podcastData, audioRef, courseData, audioStore, podcastId, toast]);

  return {
    audioInitialized,
    setAudioInitialized,
    initializationAttemptedRef
  };
}
