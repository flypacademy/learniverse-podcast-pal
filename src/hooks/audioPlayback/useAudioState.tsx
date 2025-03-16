
import { useState, useRef } from "react";

export function useAudioState(initialPosition: number = 0) {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [volume, setVolume] = useState(0.8);
  const [ready, setReady] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  return {
    isPlaying, 
    setIsPlaying,
    duration, 
    setDuration,
    currentTime, 
    setCurrentTime,
    volume, 
    setVolume,
    ready, 
    setReady,
    audioRef
  };
}
