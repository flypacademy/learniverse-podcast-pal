
import { useState } from "react";
import { usePodcastInitialization } from "./podcast/usePodcastInitialization";
import { usePodcastEventHandlers } from "./podcast/usePodcastEventHandlers";
import { usePodcastProgress } from "./podcast/usePodcastProgress";
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
  // Use the audio store for centralized state management
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

  // Use the initialization hook
  const {
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
  } = usePodcastInitialization();
  
  // Use the progress tracking hook
  const {
    saveProgress,
    handleCompletion,
    fetchUserProgress
  } = usePodcastProgress(
    podcastId,
    audioRef,
    isPlaying,
    duration,
    currentTime,
    podcastData?.course_id
  );
  
  // Use the event handlers hook
  const {
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError
  } = usePodcastEventHandlers(
    audioRef,
    setDuration,
    setCurrentTime,
    setReady,
    handleCompletion,
    setShowXPModal
  );
  
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
