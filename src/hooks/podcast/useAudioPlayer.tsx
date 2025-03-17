
import { useState, useEffect, useRef } from "react";
import { PodcastProgressData } from "@/types/podcast";
import { useAudioStore } from "@/lib/audioContext";
import { useAudioControls } from "./useAudioControls";
import { useAudioSync } from "./useAudioSync";
import { useProgressData } from "./useProgressData";

export function useAudioPlayer(podcastId: string | undefined) {
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use the audio sync hook
  const { syncInProgressRef } = useAudioSync(
    podcastId,
    audioRef,
    currentTime,
    duration,
    volume,
    isPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsPlaying,
    setReady
  );
  
  // Use the audio controls hook
  const {
    play,
    pause,
    togglePlayPause: togglePlay,
    seek,
    changeVolume,
    skipForward,
    skipBackward
  } = useAudioControls(audioRef, duration, setCurrentTime, syncInProgressRef);
  
  // Use the progress data hook
  const { handleProgressData } = useProgressData(audioRef, setCurrentTime);
  
  // Wrapper for togglePlayPause to pass the current isPlaying state
  const togglePlayPause = () => togglePlay(isPlaying);

  return {
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
  };
}
