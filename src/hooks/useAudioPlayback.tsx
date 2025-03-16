
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/lib/audioContext";
import { useAudioControls } from "./audioPlayback/useAudioControls";
import { useAudioEvents } from "./audioPlayback/useAudioEvents";
import { useAudioState } from "./audioPlayback/useAudioState";
import { useAudioSync } from "./audioPlayback/useAudioSync";

export function useAudioPlayback(initialPosition: number = 0) {
  const { toast } = useToast();
  const globalAudioStore = useAudioStore();
  const isUnmountingRef = useRef(false);
  
  // Audio state management using a dedicated hook
  const {
    isPlaying, setIsPlaying,
    duration, setDuration,
    currentTime, setCurrentTime,
    volume, setVolume,
    ready, setReady,
    audioRef
  } = useAudioState(initialPosition);
  
  // Sync with global audio store
  useAudioSync({
    globalAudioStore,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume
  });
  
  // Set up audio controls
  const { 
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward
  } = useAudioControls({ 
    audioRef, 
    setIsPlaying, 
    setCurrentTime, 
    toast 
  });

  // Set up audio event handlers
  useAudioEvents({
    audioRef,
    setIsPlaying
  });
  
  // Set unmounting flag on cleanup
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  return {
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
  };
}
