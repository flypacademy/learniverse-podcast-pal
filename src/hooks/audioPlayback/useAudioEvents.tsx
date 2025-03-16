
import { RefObject, useEffect, useRef } from "react";

interface UseAudioEventsProps {
  audioRef: RefObject<HTMLAudioElement>;
  setIsPlaying: (isPlaying: boolean) => void;
}

export function useAudioEvents({ 
  audioRef, 
  setIsPlaying 
}: UseAudioEventsProps) {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    mountedRef.current = true;
    
    // Safely update state only if the component is still mounted
    const safeSetIsPlaying = (value: boolean) => {
      if (mountedRef.current) {
        setIsPlaying(value);
      }
    };
    
    const audioElement = audioRef.current;
    
    if (!audioElement) {
      return;
    }
    
    // Define event handlers
    const handlePlay = () => safeSetIsPlaying(true);
    const handlePause = () => safeSetIsPlaying(false);
    const handleEnded = () => safeSetIsPlaying(false);
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
      mountedRef.current = false;
      
      if (audioElement) {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [audioRef, setIsPlaying]);
  
  return null;
}
