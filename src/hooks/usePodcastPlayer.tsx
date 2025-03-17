
import { useState, useEffect } from "react";
import { usePodcastData } from "./podcast/usePodcastData";
import { useAudioPlayer } from "./podcast/useAudioPlayer";
import { useProgressTracking } from "./podcast/useProgressTracking";
import { useToast } from "@/components/ui/use-toast";

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
    isQuizAvailable
  } = usePodcastData();
  
  const {
    ready,
    setReady,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
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
    handleProgressData
  } = useAudioPlayer(podcastId);
  
  const { saveProgress, handleCompletion, fetchUserProgress } = useProgressTracking(
    podcastId,
    audioRef,
    isPlaying,
    podcastData?.course_id
  );
  
  // Load user progress when podcast data is available
  useEffect(() => {
    async function loadUserProgress() {
      if (podcastData) {
        const progressData = await fetchUserProgress();
        if (progressData) {
          handleProgressData(progressData);
        }
      }
    }
    
    loadUserProgress();
  }, [podcastData]);
  
  // Handle podcast completion
  const handlePodcastCompletion = async () => {
    const success = await handleCompletion();
    if (success) {
      setShowXPModal(true);
    }
  };
  
  return {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    setReady,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
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
    handleCompletion: handlePodcastCompletion
  };
}
