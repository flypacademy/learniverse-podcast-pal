
import { useEffect, RefObject, useState } from "react";
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
  
  useEffect(() => {
    if (!podcastData || !podcastData.audio_url) {
      console.error("Invalid podcast data - missing audio URL");
      setHasError(true);
      toast({
        title: "Error",
        description: "Audio file information is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (podcastData && courseData && audioRef.current && ready && !audioInitialized) {
      console.log("Registering podcast with global audio store");
      
      try {
        // Check if audio URL is valid
        if (!podcastData.audio_url) {
          throw new Error("Missing audio URL");
        }

        // Check if the audio element has a valid src
        if (!audioRef.current.src) {
          throw new Error("Audio element has no source");
        }
        
        // Only register if it's not the same podcast already playing
        if (audioStore.currentPodcastId !== podcastData.id) {
          audioStore.setAudio(audioRef.current, podcastData.id, {
            id: podcastData.id,
            title: podcastData.title,
            courseName: courseData.title,
            image: podcastData.image_url || courseData.image,
            audioUrl: podcastData.audio_url
          });
        }
        
        setAudioInitialized(true);
      } catch (err) {
        console.error("Error registering audio with store:", err);
        setHasError(true);
        toast({
          title: "Error",
          description: "Could not initialize audio playback",
          variant: "destructive"
        });
      }
    }
  }, [podcastData, courseData, audioRef, ready, audioStore, audioInitialized, setHasError]);
  
  return null; // This is a functional component that doesn't render anything
};

export default AudioRegistration;
