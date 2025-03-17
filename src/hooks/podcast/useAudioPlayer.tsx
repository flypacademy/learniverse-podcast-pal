
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
  
  // Initialize audio from global store if available
  useEffect(() => {
    if (audioStore.currentPodcastId === podcastId && audioStore.audioElement) {
      audioRef.current = audioStore.audioElement;
      setIsPlaying(audioStore.isPlaying);
      setCurrentTime(audioStore.currentTime);
      setDuration(audioStore.duration);
      setReady(true);
    } else if (audioRef.current) {
      // Register this audio element with the store
      if (podcastId && audioRef.current) {
        audioStore.setAudio(audioRef.current, podcastId);
      }
    }
  }, [audioStore, podcastId]);
  
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0) {
      setCurrentTime(progressData.last_position);
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = progressData.last_position;
        } catch (error) {
          console.error("Error setting audio currentTime:", error);
        }
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
              audioStore.play();
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
        audioStore.pause();
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
