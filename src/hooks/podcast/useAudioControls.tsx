
import { useEffect, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";

export function useAudioControls(
  audioRef: React.RefObject<HTMLAudioElement>, 
  duration: number, 
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  syncInProgressRef: React.MutableRefObject<boolean>
) {
  const audioStore = useAudioStore();
  
  const play = () => {
    if (audioRef.current) {
      try {
        // Stop any other audio that might be playing
        const storeAudioElement = audioStore.audioElement;
        if (storeAudioElement && storeAudioElement !== audioRef.current && !storeAudioElement.paused) {
          console.log("Stopping other audio before playing this one");
          storeAudioElement.pause();
        }
        
        console.log("Play called, attempting to play audio");
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              // Only update the store if our local state changed
              if (!audioStore.isPlaying) {
                syncInProgressRef.current = true;
                audioStore.play();
                syncInProgressRef.current = false;
              }
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              // Try one more time with a small delay
              setTimeout(() => {
                if (audioRef.current) {
                  console.log("Retrying playback after error");
                  audioRef.current.play().catch(e => {
                    console.error("Retry play attempt also failed:", e);
                  });
                }
              }, 100);
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
        console.log("Pause called, pausing audio");
        audioRef.current.pause();
        // Only update the store if our local state changed
        if (audioStore.isPlaying) {
          syncInProgressRef.current = true;
          audioStore.pause();
          syncInProgressRef.current = false;
        }
      }
    } catch (error) {
      console.error("Error pausing audio:", error);
    }
  };
  
  const togglePlayPause = (isPlaying: boolean) => {
    console.log("Toggle play/pause with isPlaying:", isPlaying);
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
        console.log("Seeking to position:", newTime, "seconds");
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        
        syncInProgressRef.current = true;
        audioStore.setCurrentTime(newTime);
        syncInProgressRef.current = false;
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
        
        syncInProgressRef.current = true;
        audioStore.setVolume(value);
        syncInProgressRef.current = false;
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
        
        syncInProgressRef.current = true;
        audioStore.setCurrentTime(newTime);
        syncInProgressRef.current = false;
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
        
        syncInProgressRef.current = true;
        audioStore.setCurrentTime(newTime);
        syncInProgressRef.current = false;
      } catch (error) {
        console.error("Error skipping backward:", error);
      }
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
