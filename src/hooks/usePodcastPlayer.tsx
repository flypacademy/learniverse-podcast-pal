
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
    if (audioRef.current && initialPosition > 0 && !audioInitialized) {
      console.log("Setting initial position from progress data:", initialPosition);
      audioRef.current.currentTime = initialPosition;
      setCurrentTime(initialPosition);
      setAudioInitialized(true);
    }
  }, [audioRef.current, initialPosition, audioInitialized]);

  // Cleanup on unmount - but don't stop playback if it's in the global store
  useEffect(() => {
    return () => {
      console.log("usePodcastPlayer hook - Cleaning up");
      
      // Only clean up the audio element if we're not continuing playback in the mini player
      if (audioRef.current && (!audioStore.audioElement || audioStore.audioElement !== audioRef.current)) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioStore.audioElement]);

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
