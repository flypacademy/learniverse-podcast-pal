
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/lib/audioContext";
import { useAudioControls } from "./audioPlayback/useAudioControls";
import { useAudioEvents } from "./audioPlayback/useAudioEvents";

export function useAudioPlayback(initialPosition: number = 0) {
  const { toast } = useToast();
  const globalAudioStore = useAudioStore();
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [volume, setVolume] = useState(0.8);
  const [ready, setReady] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialSyncRef = useRef(true);
  
  // Sync with global audio store if already playing
  useEffect(() => {
    if (globalAudioStore.audioElement && isInitialSyncRef.current) {
      console.log("Syncing state with global audio store");
      setIsPlaying(globalAudioStore.isPlaying);
      setCurrentTime(globalAudioStore.currentTime);
      setDuration(globalAudioStore.duration);
      setVolume(globalAudioStore.volume);
      isInitialSyncRef.current = false;
    }
  }, [globalAudioStore]);
  
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
