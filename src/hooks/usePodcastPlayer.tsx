
import { useState, useEffect, useRef } from "react";
import { usePodcastData } from "./podcast/usePodcastData";
import { useProgressTracking } from "./podcast/useProgressTracking";
import { useToast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/lib/audioContext";

export interface PodcastData {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string | null;
  duration: number;
  description?: string | null;
  course_id?: string;
}

export interface CourseData {
  id: string;
  title: string;
  image?: string;
}

export function usePodcastPlayer() {
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
  
  // Use central audio store for state management
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    setCurrentTime,
    setDuration,
    setVolume
  } = useAudioStore();
  
  // Initialize the progress tracking hooks
  const {
    saveProgress,
    handleCompletion,
    fetchUserProgress
  } = useProgressTracking(
    podcastId,
    audioRef.current,
    isPlaying,
    duration,
    currentTime,
    podcastData?.course_id
  );
  
  // Load saved progress when podcast data is available
  useEffect(() => {
    async function loadUserProgress() {
      if (podcastData && audioRef.current) {
        const progressData = await fetchUserProgress();
        if (progressData && progressData.last_position > 0) {
          console.log("Restoring saved position:", progressData.last_position);
          audioRef.current.currentTime = progressData.last_position;
          setCurrentTime(progressData.last_position);
        }
      }
    }
    
    if (podcastData) {
      loadUserProgress();
    }
  }, [podcastData, fetchUserProgress, setCurrentTime]);
  
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
  
  // Event handlers for audio element
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log("Audio metadata loaded, duration:", audioDuration);
      setDuration(audioDuration);
      setReady(true);
    }
  };
  
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleAudioEnded = () => {
    handleCompletion().then(success => {
      if (success) {
        setShowXPModal(true);
        setTimeout(() => setShowXPModal(false), 5000);
      }
    });
  };
  
  const handleAudioPlay = () => {
    console.log("Play called");
  };
  
  const handleAudioPause = () => {
    // This is handled by the audio store pause() method
  };
  
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio error:", e);
    toast({
      title: "Playback Error",
      description: "There was an error playing this podcast. Please try again.",
      variant: "destructive"
    });
  };
  
  // Player control methods
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (percent: number) => {
    if (duration > 0) {
      const newTime = (percent / 100) * duration;
      setCurrentTime(newTime);
    }
  };
  
  const skipForward = () => {
    const newTime = Math.min(currentTime + 15, duration);
    setCurrentTime(newTime);
  };
  
  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 15);
    setCurrentTime(newTime);
  };
  
  const changeVolume = (newVolume: number) => {
    const safeVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(safeVolume);
  };
  
  return {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    setReady,
    isPlaying,
    duration,
    currentTime,
    volume,
    isQuizAvailable,
    showXPModal,
    setShowXPModal,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError,
    refetchPodcastData,
    handleCompletion
  };
}
