
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
  const podcastMetaSetRef = useRef(false);

  // Save podcast metadata to the global store when it's loaded, but only once
  useEffect(() => {
    if (podcastData && !loading && !podcastMetaSetRef.current && podcastId) {
      console.log("useAudioInitialization: Setting podcast metadata for:", podcastData.title);
      podcastMetaSetRef.current = true;
      
      // Only set metadata if this is a new podcast or if metadata has changed
      const currentMetaId = audioStore.podcastMeta?.id;
      if (currentMetaId !== podcastData.id) {
        audioStore.setPodcastMeta({
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData?.title || "Unknown Course",
          image: podcastData.image_url || courseData?.image || undefined
        });
      }
    }
    
    // Reset metadata flag when podcast changes
    return () => {
      if (podcastId) {
        podcastMetaSetRef.current = false;
      }
    };
  }, [podcastData, courseData, loading, audioStore, podcastId]);

  // Create and configure audio element when podcast data is loaded
  useEffect(() => {
    // Skip if already initialized or missing data
    if (
      !podcastData?.audio_url || 
      !audioRef.current || 
      initializationAttemptedRef.current || 
      !podcastId
    ) {
      return;
    }
    
    initializationAttemptedRef.current = true;
    
    try {
      console.log("useAudioInitialization: Configuring audio element with URL:", podcastData.audio_url);
      
      // Check if we already have this podcast in the store
      const isSamePodcast = audioStore.currentPodcastId === podcastId;
      
      if (isSamePodcast && audioStore.audioElement) {
        console.log("useAudioInitialization: Using existing audio element from store");
        
        // Preserve current time when returning to the same podcast
        const storedCurrentTime = audioStore.currentTime;
        const wasPlaying = audioStore.isPlaying;
        
        if (audioRef.current !== audioStore.audioElement) {
          // If we have a different audio element reference but same podcast
          audioRef.current.src = podcastData.audio_url;
          audioRef.current.load();
        }

        // Set audio element to the stored position
        if (storedCurrentTime > 0) {
          console.log("Restoring audio position to:", storedCurrentTime);
          audioRef.current.currentTime = storedCurrentTime;
        }
        
        // Register with audio store, but preserve current time and playing state
        audioStore.setAudio(audioRef.current, podcastId, {
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData?.title || "Unknown Course",
          image: podcastData.image_url || courseData?.image || undefined
        });
        
        // Ensure playing state is preserved
        if (wasPlaying) {
          // Increase timeout to ensure DOM is fully ready
          setTimeout(() => {
            console.log("Resuming playback after navigation");
            if (audioRef.current) {
              const playPromise = audioRef.current.play();
              if (playPromise) {
                playPromise.catch(err => {
                  console.warn("Failed to auto-resume playback:", err);
                });
              }
            }
          }, 300);
        }
        
        setAudioInitialized(true);
        return;
      }
      
      // For a new podcast, make sure we have the audio URL set
      if (audioRef.current && !audioRef.current.src) {
        console.log("Setting initial audio src to:", podcastData.audio_url);
        audioRef.current.src = podcastData.audio_url;
        audioRef.current.load();
      }
      
      // Don't reset time to 0 immediately - we'll handle this in the progress loading logic
      
      // Register with audio store
      if (audioRef.current) {
        console.log("Registering new audio element with store for podcast:", podcastId);
        audioStore.setAudio(audioRef.current, podcastId, {
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData?.title || "Unknown Course",
          image: podcastData.image_url || courseData?.image || undefined
        });
      }
      
      setAudioInitialized(true);
    } catch (error) {
      console.error("Error initializing audio:", error);
      toast({
        title: "Error",
        description: "Failed to initialize audio player",
        variant: "destructive"
      });
    }
  }, [podcastData, audioRef, courseData, audioStore, podcastId, toast]);

  return {
    audioInitialized,
    setAudioInitialized,
    initializationAttemptedRef
  };
}
