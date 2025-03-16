
import { useEffect, RefObject, useState, memo } from "react";
import { useAudioStore } from "@/lib/audio/audioStore";
import { PodcastData, CourseData } from "@/types/podcast";
import { toast } from "@/components/ui/use-toast";

interface AudioRegistrationProps {
  audioRef: RefObject<HTMLAudioElement>;
  podcastData: PodcastData;
  courseData: CourseData | null;
  ready: boolean;
  setHasError: (hasError: boolean) => void;
}

const AudioRegistration = ({
  audioRef,
  podcastData,
  courseData,
  ready,
  setHasError
}: AudioRegistrationProps) => {
  const audioStore = useAudioStore();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  
  // Log component lifecycle
  useEffect(() => {
    console.log("AudioRegistration mounted", { 
      podcastId: podcastData?.id,
      audioReady: ready,
      audioRefExists: !!audioRef.current
    });
    
    return () => {
      console.log("AudioRegistration component unmounting");
    };
  }, []);
  
  // Validate podcast data early - only run once
  useEffect(() => {
    if (!podcastData || !podcastData.audio_url) {
      console.error("Invalid podcast data - missing audio URL");
      setHasError(true);
      toast({
        title: "Error",
        description: "Audio file information is missing",
        variant: "destructive"
      });
    }
  }, [podcastData, setHasError]);
  
  // Audio registration with retry mechanism - careful with dependencies to avoid loops
  useEffect(() => {
    // If already initialized, don't try again
    if (audioInitialized) return;
    
    // If we've tried too many times, give up
    if (registrationAttempts >= 3) {
      console.error("Failed to initialize audio after multiple attempts");
      setHasError(true);
      return;
    }
    
    // Check if we have all the required data and elements
    if (!podcastData?.audio_url || !courseData || !audioRef.current) {
      console.log("Waiting for required data before registering audio...", {
        hasAudioUrl: !!podcastData?.audio_url,
        hasCourseData: !!courseData, 
        hasAudioRef: !!audioRef.current
      });
      
      // Retry after a delay
      if (registrationAttempts < 3) {
        const timer = setTimeout(() => {
          setRegistrationAttempts(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
      return;
    }
    
    // If audio is not ready yet but we have all data, wait for it
    if (!ready && registrationAttempts < 3) {
      console.log("Audio element not ready yet, waiting...");
      const timer = setTimeout(() => {
        setRegistrationAttempts(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Now attempt to register with the store
    console.log("Attempting to register podcast with global audio store");
    
    try {
      // Check if audio URL is valid
      if (!podcastData.audio_url) {
        throw new Error("Missing audio URL");
      }
      
      // Only register if it's not the same podcast already playing
      if (audioStore.currentPodcastId !== podcastData.id) {
        console.log("Registering new podcast with global audio store:", {
          id: podcastData.id,
          title: podcastData.title,
          url: podcastData.audio_url
        });
        
        audioStore.setAudio(audioRef.current, podcastData.id, {
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData.title,
          image: podcastData.image_url || courseData.image,
          audioUrl: podcastData.audio_url
        });
      } else {
        console.log("Podcast already registered with store, updating metadata only");
        audioStore.setPodcastMeta({
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData.title,
          image: podcastData.image_url || courseData.image,
          audioUrl: podcastData.audio_url
        });
      }
      
      setAudioInitialized(true);
      console.log("Audio registration successful");
      
    } catch (err) {
      console.error("Error registering audio with store:", err);
      
      // If we still have retries left, try again
      if (registrationAttempts < 2) {
        console.log(`Retrying audio registration (attempt ${registrationAttempts + 1})`);
        const timer = setTimeout(() => {
          setRegistrationAttempts(prev => prev + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setHasError(true);
        toast({
          title: "Error",
          description: "Could not initialize audio playback",
          variant: "destructive"
        });
      }
    }
  }, [podcastData?.id, courseData?.title, audioStore, ready, audioInitialized, registrationAttempts, setHasError]);
  
  return null; // This is a functional component that doesn't render anything
};

// Memoize to prevent unnecessary rerenders
export default memo(AudioRegistration);
