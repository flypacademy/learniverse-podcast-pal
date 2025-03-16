
import { RefObject, useEffect } from "react";

interface UseAudioEventsProps {
  audioRef: RefObject<HTMLAudioElement>;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime?: (time: number) => void;
  setDuration?: (duration: number) => void;
}

export function useAudioEvents({ 
  audioRef, 
  setIsPlaying,
  setCurrentTime,
  setDuration
}: UseAudioEventsProps) {
  
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (!audioElement) {
      return;
    }
    
    // Define event handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => {
      console.log("Audio is ready to play");
    };
    const handleTimeUpdate = () => {
      if (setCurrentTime) {
        setCurrentTime(audioElement.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (setDuration) {
        setDuration(audioElement.duration);
      }
    };
    
    // Add event listeners
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Cleanup on unmount
    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef, setIsPlaying, setCurrentTime, setDuration]);
  
  return null;
}
