import { useState, useEffect, useRef } from "react";
import { PodcastProgressData } from "@/types/podcast";
import { useAudioStore } from "@/lib/audioContext";

export function useAudioPlayer(podcastId: string | undefined) {
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioStore = useAudioStore();
  const storeInitializedRef = useRef(false);
  const syncInProgressRef = useRef(false);
  
  // Initialize audio from global store if available, but only once
  useEffect(() => {
    if (!storeInitializedRef.current && audioStore.currentPodcastId === podcastId && audioStore.audioElement) {
      storeInitializedRef.current = true;
      audioRef.current = audioStore.audioElement;
      
      // Use safe values to prevent uncontrolled/controlled component switches
      if (isFinite(audioStore.currentTime)) {
        setCurrentTime(audioStore.currentTime);
      }
      
      if (isFinite(audioStore.duration) && audioStore.duration > 0) {
        setDuration(audioStore.duration);
      }
      
      setVolume(audioStore.volume);
      setIsPlaying(audioStore.isPlaying);
      setReady(true);
    }
  }, [audioStore, podcastId]);
  
  // Keep local state in sync with the global audio store
  useEffect(() => {
    // Prevent infinite update loops by using a ref to track sync operations
    if (syncInProgressRef.current) return;
    
    if (audioRef.current && audioRef.current === audioStore.audioElement) {
      syncInProgressRef.current = true;
      
      try {
        if (isPlaying !== audioStore.isPlaying) {
          setIsPlaying(audioStore.isPlaying);
        }
        
        if (isFinite(audioStore.currentTime) && Math.abs(currentTime - audioStore.currentTime) > 0.5) {
          setCurrentTime(audioStore.currentTime);
        }
        
        if (audioStore.duration > 0 && Math.abs(duration - audioStore.duration) > 0.5) {
          setDuration(audioStore.duration);
        }
        
        if (volume !== audioStore.volume) {
          setVolume(audioStore.volume);
        }
      } finally {
        syncInProgressRef.current = false;
      }
    }
  }, [audioStore.isPlaying, audioStore.currentTime, audioStore.duration, audioStore.volume, audioRef.current, isPlaying, currentTime, duration, volume]);
  
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0 && audioRef.current) {
      try {
        audioRef.current.currentTime = progressData.last_position;
        setCurrentTime(progressData.last_position);
      } catch (error) {
        console.error("Error setting audio currentTime:", error);
      }
    }
  };
  
  const play = () => {
    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              // Only update the store if our local state changed
              if (!audioStore.isPlaying) {
                audioStore.play();
              }
            })
            .catch(error => {
              console.error("Error playing audio:", error);
            });
        }
      } catch (error: any) {
        console.error("Exception during play:", error);
      }
    } else {
      console.warn("Audio element reference is not available");
    }
  };
  
  const pause = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        // Only update the store if our local state changed
        if (audioStore.isPlaying) {
          audioStore.pause();
        }
      }
    } catch (error) {
      console.error("Error pausing audio:", error);
    }
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (percent: number) => {
    if (audioRef.current && duration > 0) {
      try {
        const newTime = (percent / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        audioStore.setCurrentTime(newTime);
      } catch (error) {
        console.error("Error seeking audio:", error);
      }
    }
  };
  
  const changeVolume = (value: number) => {
    if (audioRef.current) {
      try {
        const volumeValue = value / 100;
        audioRef.current.volume = Math.max(0, Math.min(1, volumeValue));
        setVolume(value);
        audioStore.setVolume(value);
      } catch (error) {
        console.error("Error changing volume:", error);
      }
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      try {
        const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        audioStore.setCurrentTime(newTime);
      } catch (error) {
        console.error("Error skipping forward:", error);
      }
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      try {
        const newTime = Math.max(0, audioRef.current.currentTime - 15);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        audioStore.setCurrentTime(newTime);
      } catch (error) {
        console.error("Error skipping backward:", error);
      }
    }
  };

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
