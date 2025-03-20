
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useAudioPlayer(audioUrl: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Improved event handling with better cleanup
  useEffect(() => {
    if (!audioUrl) return;

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = "metadata";
      audioRef.current.volume = volume / 100;
      
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

    // Check for readyState before adding event listeners
    if (audio.readyState >= 2) {
      // Already loaded
      handleLoadedMetadata();
    }

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);
    audio.addEventListener("canplay", handleCanPlay);

    // Ensure audio is properly loaded
    audio.load();

    // Improved cleanup
    return () => {
      if (audio) {
        // Remove all event listeners
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError as EventListener);
        audio.removeEventListener("canplay", handleCanPlay);
      }
    };
  }, [audioUrl, volume]);

  // Enhanced play function with improved error handling
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
          // Try again with a user interaction context - this helps with mobile browsers
          setTimeout(() => {
            if (audioRef.current) {
              // Use a more resilient approach for mobile browsers
              audioRef.current.muted = true; // Temporarily mute to help with autoplay restrictions
              audioRef.current.play()
                .then(() => {
                  // If successful, unmute and update state
                  audioRef.current!.muted = false;
                  setIsPlaying(true);
                })
                .catch(e => {
                  console.error("Retry play failed, even with muting:", e);
                  toast.error("Couldn't start playback. Try tapping play again.");
                });
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

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        // Properly cleanup audio element
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current.load();
          audioRef.current = null;
        } catch (e) {
          console.error("Error during audio cleanup:", e);
        }
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
