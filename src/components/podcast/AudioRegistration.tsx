
import { useEffect, RefObject, useState, memo, useRef } from "react";
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
  const registrationTimerRef = useRef<number | null>(null);
  const hasValidatedDataRef = useRef(false);
  const lastPodcastIdRef = useRef<string | null>(null);
  const isUnmountingRef = useRef(false);
  
  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      console.log("AudioRegistration component unmounting");
      isUnmountingRef.current = true;
      
      if (registrationTimerRef.current) {
        clearTimeout(registrationTimerRef.current);
        registrationTimerRef.current = null;
      }
    };
  }, []);
  
  // Validate podcast data once
  useEffect(() => {
    // Skip if we've already validated
    if (hasValidatedDataRef.current) return;
    
    if (!podcastData || !podcastData.audio_url) {
      console.error("Invalid podcast data - missing audio URL");
      setHasError(true);
      toast({
        title: "Error",
        description: "Audio file information is missing",
        variant: "destructive"
      });
    }
    
    hasValidatedDataRef.current = true;
  }, [podcastData, setHasError]);
  
  // Audio registration with retry mechanism
  useEffect(() => {
    // Skip if already initialized, unmounting, or too many attempts
    if (audioInitialized || isUnmountingRef.current || registrationAttempts >= 3) return;
    
    // Skip if podcast ID hasn't changed (prevents duplicate registrations)
    if (lastPodcastIdRef.current === podcastData?.id) return;
    
    // Check if we have all required data and elements
    const hasRequiredData = 
      podcastData?.audio_url && 
      courseData && 
      audioRef.current;
    
    if (!hasRequiredData) {
      console.log("Waiting for required data before registering audio...", {
        hasAudioUrl: !!podcastData?.audio_url,
        hasCourseData: !!courseData, 
        hasAudioRef: !!audioRef.current
      });
      
      // Schedule a retry with increasing delay
      if (registrationAttempts < 3) {
        const delay = (registrationAttempts + 1) * 500;
        
        // Clear any existing timer
        if (registrationTimerRef.current) {
          clearTimeout(registrationTimerRef.current);
        }
        
        // Set new timer
        registrationTimerRef.current = window.setTimeout(() => {
          if (!isUnmountingRef.current) {
            setRegistrationAttempts(prev => prev + 1);
            registrationTimerRef.current = null;
          }
        }, delay);
      }
      
      return;
    }
    
    // If audio is not ready yet but we have all data, wait for it
    if (!ready && registrationAttempts < 3) {
      console.log("Audio element not ready yet, waiting...");
      
      // Clear any existing timer
      if (registrationTimerRef.current) {
        clearTimeout(registrationTimerRef.current);
      }
      
      // Set new timer
      registrationTimerRef.current = window.setTimeout(() => {
        if (!isUnmountingRef.current) {
          setRegistrationAttempts(prev => prev + 1);
          registrationTimerRef.current = null;
        }
      }, 500);
      
      return;
    }
    
    // Store current podcast ID to prevent duplicate registrations
    lastPodcastIdRef.current = podcastData.id;
    
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
      }
      
      setAudioInitialized(true);
      console.log("Audio registration successful");
      
    } catch (err) {
      console.error("Error registering audio with store:", err);
      
      // If we still have retries left, try again
      if (registrationAttempts < 2 && !isUnmountingRef.current) {
        console.log(`Retrying audio registration (attempt ${registrationAttempts + 1})`);
        
        // Clear any existing timer
        if (registrationTimerRef.current) {
          clearTimeout(registrationTimerRef.current);
        }
        
        // Set new timer with increasing delay
        registrationTimerRef.current = window.setTimeout(() => {
          if (!isUnmountingRef.current) {
            setRegistrationAttempts(prev => prev + 1);
            registrationTimerRef.current = null;
          }
        }, 500 * (registrationAttempts + 1));
        
      } else if (!isUnmountingRef.current) {
        setHasError(true);
        toast({
          title: "Error",
          description: "Could not initialize audio playback",
          variant: "destructive"
        });
      }
    }
  }, [
    podcastData?.id, 
    courseData?.title, 
    audioStore, 
    ready, 
    audioInitialized, 
    registrationAttempts, 
    setHasError
  ]);
  
  return null; // This component doesn't render anything
};

// Memoize to prevent unnecessary rerenders
export default memo(AudioRegistration);
