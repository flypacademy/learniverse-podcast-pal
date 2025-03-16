
import { RefObject, useRef } from "react";

interface UseAudioControlsProps {
  audioRef: RefObject<HTMLAudioElement>;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  toast: any;
}

export function useAudioControls({ 
  audioRef, 
  setIsPlaying, 
  setCurrentTime,
  toast 
}: UseAudioControlsProps) {
  const isPlayAttemptedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const clearPlayTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const play = () => {
    if (!audioRef.current) {
      console.warn("Play called but audioRef is null");
      return;
    }
    
    console.log("Playing audio");
    isPlayAttemptedRef.current = true;
    clearPlayTimeout();
    
    // Check if the audio is actually loaded and ready
    if (audioRef.current.readyState < 2) {
      console.log("Audio not ready yet, loading...");
      
      const canPlayHandler = () => {
        if (!audioRef.current) return;
        
        console.log("Audio is now ready to play");
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
        
        // Remove event listener
        audioRef.current.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioRef.current.addEventListener('canplay', canPlayHandler);
      
      // Also set a timeout in case canplay never fires
      timeoutRef.current = window.setTimeout(() => {
        if (!isPlayAttemptedRef.current || !audioRef.current) return;
        
        console.log("Timeout: trying to play anyway");
        audioRef.current.play()
          .then(() => {
            console.log("Audio playback started successfully after timeout");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing audio after timeout:", err);
            // Try once more after a longer delay
            timeoutRef.current = window.setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(() => {
                    console.log("Audio playback started successfully after second attempt");
                    setIsPlaying(true);
                  })
                  .catch(finalErr => {
                    console.error("Final error playing audio:", finalErr);
                    toast({
                      title: "Playback Error",
                      description: "Could not play audio. Try reloading the page.",
                      variant: "destructive"
                    });
                  });
              }
            }, 1000);
          });
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
    clearPlayTimeout();
    
    if (audioRef.current) {
      console.log("Pausing audio");
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.warn("Pause called but audioRef is null");
    }
  };
  
  const togglePlayPause = () => {
    if (audioRef.current?.paused) {
      play();
    } else {
      pause();
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
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward
  };
}
