
import { useEffect, RefObject, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { PodcastData, CourseData } from "@/types/podcast";

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
  
  useEffect(() => {
    if (podcastData && courseData && audioRef.current && ready && !audioInitialized) {
      console.log("Registering podcast with global audio store");
      
      try {
        // Only register if it's not the same podcast already playing
        if (audioStore.currentPodcastId !== podcastData.id) {
          audioStore.setAudio(audioRef.current, podcastData.id, {
            id: podcastData.id,
            title: podcastData.title,
            courseName: courseData.title,
            image: podcastData.image_url || courseData.image
          });
        }
        
        setAudioInitialized(true);
      } catch (err) {
        console.error("Error registering audio with store:", err);
        setHasError(true);
      }
    }
    
    // Cleanup function
    return () => {
      console.log("AudioRegistration component unmounting");
    };
  }, [podcastData, courseData, audioRef, ready, audioStore, audioInitialized, setHasError]);
  
  return null; // This is a functional component that doesn't render anything
};

export default AudioRegistration;
