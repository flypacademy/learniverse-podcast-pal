
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePodcastData } from "./usePodcastData";
import { useAudioPlayback } from "./useAudioPlayback";
import { useProgressTracking } from "./useProgressTracking";
import { useAudioStore } from "@/lib/audioContext";
import type { PodcastData, CourseData } from "@/types/podcast";

export type { PodcastData, CourseData };

export function usePodcastPlayer() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioStore = useAudioStore();
  
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
    if (audioRef.current && initialPosition > 0 && !audioInitialized && ready) {
      console.log("Setting initial position from progress data:", initialPosition);
      try {
        audioRef.current.currentTime = initialPosition;
        setCurrentTime(initialPosition);
        setAudioInitialized(true);
      } catch (err) {
        console.error("Error setting initial position:", err);
        // Still mark as initialized to avoid repeated attempts
        setAudioInitialized(true);
      }
    }
  }, [audioRef.current, initialPosition, audioInitialized, ready, setCurrentTime]);

  // IMPORTANT: Don't stop playback when unmounting the component
  useEffect(() => {
    return () => {
      console.log("usePodcastPlayer hook - Unmounting, preserving audio state");
      
      // Don't pause or clean up the audio element
      // This allows playback to continue when navigating away
      
      // Update global store time one last time before unmounting
      if (audioRef.current && audioStore.audioElement === audioRef.current && podcastId) {
        audioStore.setCurrentTime(audioRef.current.currentTime);
      }
    };
  }, [audioStore, audioRef, podcastId]);

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
