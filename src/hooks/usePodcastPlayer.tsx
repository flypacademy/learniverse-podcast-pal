
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePodcastData } from "./usePodcastData";
import { useAudioPlayback } from "./useAudioPlayback";
import { useProgressTracking } from "./useProgressTracking";
import type { PodcastData, CourseData } from "@/types/podcast";

export type { PodcastData, CourseData };

export function usePodcastPlayer() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Get podcast data
  const {
    podcastData,
    courseData,
    loading,
    error,
    isQuizAvailable,
    initialPosition
  } = usePodcastData(podcastId);
  
  // Set up audio playback controls
  const {
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
    ready,
    setReady,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward
  } = useAudioPlayback(initialPosition);
  
  // Set up progress tracking
  const {
    showXPModal,
    setShowXPModal,
    handleCompletion
  } = useProgressTracking(podcastId, isPlaying, podcastData);
  
  // Apply initial position from user progress when audio is ready
  useEffect(() => {
    if (audioRef.current && initialPosition > 0 && !audioInitialized) {
      console.log("Setting initial position from progress data:", initialPosition);
      audioRef.current.currentTime = initialPosition;
      setCurrentTime(initialPosition);
      setAudioInitialized(true);
    }
  }, [audioRef.current, initialPosition, audioInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("usePodcastPlayer hook - Cleaning up");
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

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
    handleCompletion
  };
}
