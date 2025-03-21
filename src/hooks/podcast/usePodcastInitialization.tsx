
import { useState, useEffect, useRef } from "react";
import { usePodcastData } from "./usePodcastData";
import { useAudioStore } from "@/lib/audioContext";
import { useToast } from "@/components/ui/use-toast";

export function usePodcastInitialization() {
  const { toast } = useToast();
  const {
    podcastId,
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable,
    refetchPodcastData
  } = usePodcastData();
  
  // Local state for UI and initialization
  const [ready, setReady] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  // Audio element ref for player components
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up audio element when podcast data loads
  useEffect(() => {
    if (!audioRef.current && podcastData) {
      console.log("Creating new audio element with URL:", podcastData.audio_url);
      audioRef.current = new Audio(podcastData.audio_url);
      
      // Register the audio element with the store
      if (podcastId) {
        // Set podcast metadata in the store
        const meta = {
          id: podcastData.id,
          title: podcastData.title,
          courseName: courseData?.title || "Course",
          image: podcastData.image_url || courseData?.image
        };
        
        // This is crucial - register with the store
        console.log("Registering audio element with store", meta);
        useAudioStore.getState().setAudio(audioRef.current, podcastId, meta);
      }
    }
  }, [podcastData, courseData, podcastId]);

  return {
    podcastId,
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable,
    refetchPodcastData,
    ready,
    setReady,
    showXPModal,
    setShowXPModal,
    audioRef
  };
}
