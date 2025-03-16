
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/lib/audioContext";

export function useAudioPlayback(initialPosition: number = 0) {
  const { toast } = useToast();
  const globalAudioStore = useAudioStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [volume, setVolume] = useState(0.8);
  const [ready, setReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialSyncRef = useRef(true);
  const isPlayAttemptedRef = useRef(false);
  
  // Check if this podcast is already playing in the global store
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
  
  const play = () => {
    if (!audioRef.current) {
      console.warn("Play called but audioRef is null");
      return;
    }
    
    console.log("Playing audio");
    isPlayAttemptedRef.current = true;
    
    // Check if the audio is actually loaded and ready
    if (audioRef.current.readyState < 2) {
      console.log("Audio not ready yet, loading...");
      
      const canPlayHandler = () => {
        console.log("Audio is now ready to play");
        audioRef.current?.play()
          .then(() => {
            console.log("Audio playback started successfully");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            toast({
              title: "Playback Error",
              description: "Could not play audio: " + err.message,
              variant: "destructive"
            });
          });
        
        // Remove event listener
        audioRef.current?.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioRef.current.addEventListener('canplay', canPlayHandler);
      
      // Also set a timeout in case canplay never fires
      setTimeout(() => {
        if (!isPlaying && isPlayAttemptedRef.current) {
          console.log("Timeout: trying to play anyway");
          audioRef.current?.play()
            .then(() => {
              console.log("Audio playback started successfully after timeout");
              setIsPlaying(true);
            })
            .catch(err => {
              console.error("Error playing audio after timeout:", err);
              toast({
                title: "Playback Error",
                description: "Could not play audio. Try reloading the page.",
                variant: "destructive"
              });
            });
        }
      }, 2000);
      
      return;
    }
    
    // If audio is already loaded, try to play directly
    audioRef.current.play()
      .then(() => {
        console.log("Audio playback started successfully");
        setIsPlaying(true);
      })
      .catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback Error",
          description: "Could not play audio: " + err.message,
          variant: "destructive"
        });
      });
  };
  
  const pause = () => {
    if (audioRef.current) {
      console.log("Pausing audio");
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.warn("Pause called but audioRef is null");
    }
  };
  
  const togglePlayPause = () => {
    console.log("Toggle play/pause, current state:", isPlaying);
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      console.log("Seeking to time:", time);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      console.warn("Seek called but audioRef is null");
    }
  };
  
  const changeVolume = (value: number) => {
    if (audioRef.current) {
      // Ensure value is between 0 and 1
      const safeValue = Math.max(0, Math.min(1, value));
      console.log("Changing volume to:", safeValue);
      audioRef.current.volume = safeValue;
      setVolume(safeValue);
    } else {
      console.warn("changeVolume called but audioRef is null");
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 15);
      console.log("Skipping forward to:", newTime);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.warn("skipForward called but audioRef is null");
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      console.log("Skipping backward to:", newTime);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.warn("skipBackward called but audioRef is null");
    }
  };

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
