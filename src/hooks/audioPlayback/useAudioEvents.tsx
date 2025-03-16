
import { RefObject, useEffect } from "react";

interface UseAudioEventsProps {
  audioRef: RefObject<HTMLAudioElement>;
  setIsPlaying: (isPlaying: boolean) => void;
}

export function useAudioEvents({ 
  audioRef, 
  setIsPlaying 
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
    
    // Add event listeners
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('canplay', handleCanPlay);
    
    // Cleanup on unmount
    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioRef, setIsPlaying]);
  
  return null;
}
