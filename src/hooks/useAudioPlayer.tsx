
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useAudioPlayer(audioUrl: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume / 100;
      
      // Log for debugging
      console.log("Created new audio element with URL:", audioUrl);
    } else if (audioRef.current.src !== audioUrl) {
      // Update source if URL changes
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      console.log("Updated audio source to:", audioUrl);
    }

    // Set up event listeners
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      console.log("Audio playback ended");
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      toast.error("Error loading audio");
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);
    audio.addEventListener("canplay", handleCanPlay);

    // Initial load
    if (audio.readyState >= 2) {
      // Already loaded
      handleLoadedMetadata();
    } else {
      audio.load();
    }

    // Cleanup
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioUrl, volume]);

  // Controls
  const play = () => {
    if (!audioRef.current) return;
    
    console.log("Play called");
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Playback started successfully");
          setIsPlaying(true);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          // Try again after a short delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Retry play failed:", e));
            }
          }, 300);
        });
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    
    console.log("Pause called");
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (percent: number) => {
    if (!audioRef.current || duration <= 0) return;
    
    const newTime = (percent / 100) * duration;
    console.log(`Seeking to ${newTime}s (${percent}%)`);
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.min(audioRef.current.duration, currentTime + 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, currentTime - 15);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (value: number) => {
    if (!audioRef.current) return;
    
    const safeVolume = Math.max(0, Math.min(100, value));
    audioRef.current.volume = safeVolume / 100;
    setVolume(safeVolume);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  return {
    isLoading,
    isPlaying,
    duration,
    currentTime,
    volume,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    changeVolume,
    setCurrentTime
  };
}
