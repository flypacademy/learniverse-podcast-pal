
import React, { RefObject, useEffect, useState, memo, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

interface AudioElementProps {
  audioRef: RefObject<HTMLAudioElement>;
  audioUrl: string;
  setDuration: (duration: number) => void;
  setReady: (ready: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  onAudioEnded: () => void;
  setHasError: (hasError: boolean) => void;
}

const AudioElement = ({
  audioRef,
  audioUrl,
  setDuration,
  setReady,
  setCurrentTime,
  setIsPlaying,
  onAudioEnded,
  setHasError
}: AudioElementProps) => {
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const hasSetupEvents = useRef(false);
  const lastTimeUpdateRef = useRef(0);
  
  // Validate audio URL once on mount
  useEffect(() => {
    if (!audioUrl) {
      console.error("Invalid audio URL provided:", audioUrl);
      setIsValidUrl(false);
      setHasError(true);
      return;
    }
    
    try {
      // Validate URL format
      new URL(audioUrl);
      setIsValidUrl(true);
    } catch (err) {
      console.error("Invalid audio URL format:", audioUrl, err);
      setIsValidUrl(false);
      setHasError(true);
    }
    
    console.log("AudioElement mounted with URL:", audioUrl);
    
    return () => {
      console.log("AudioElement unmounting");
      hasSetupEvents.current = false;
    };
  }, [audioUrl, setHasError]);
  
  // This useEffect sets up the event listeners only once to prevent re-renders
  useEffect(() => {
    if (!isValidUrl || !audioRef.current || hasSetupEvents.current) return;
    
    const element = audioRef.current;
    
    // Attach event listeners
    const handleMetadataLoaded = () => {
      if (element) {
        console.log("Audio loaded metadata:", {
          duration: element.duration,
          src: element.src
        });
        setDuration(element.duration);
        setReady(true);
        setLoadAttempts(0);
      }
    };
    
    const handleTimeUpdate = () => {
      if (element) {
        // Throttle time updates to reduce re-renders
        if (Math.abs(element.currentTime - lastTimeUpdateRef.current) >= 0.5) {
          lastTimeUpdateRef.current = element.currentTime;
          setCurrentTime(element.currentTime);
        }
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      onAudioEnded();
    };
    
    const handleCanPlay = () => {
      console.log("Audio is ready to play");
      setReady(true);
    };
    
    const handleError = (e: Event) => {
      console.error("Direct audio element error:", e);
      const target = e.target as HTMLAudioElement;
      const errorCode = target.error ? target.error.code : 'unknown';
      const errorMessage = target.error ? target.error.message : 'Unknown error';
      
      console.error(`Direct audio error details: code=${errorCode}, message=${errorMessage}`);
      
      // Retry logic
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        setTimeout(() => {
          if (element) {
            element.load();
          }
        }, 1000);
      } else {
        setHasError(true);
      }
    };
    
    // Add event listeners
    element.addEventListener('loadedmetadata', handleMetadataLoaded);
    element.addEventListener('timeupdate', handleTimeUpdate);
    element.addEventListener('play', handlePlay);
    element.addEventListener('pause', handlePause);
    element.addEventListener('ended', handleEnded);
    element.addEventListener('canplay', handleCanPlay);
    element.addEventListener('error', handleError);
    
    // Mark that we've set up events
    hasSetupEvents.current = true;
    
    // Clean up function
    return () => {
      if (element) {
        element.removeEventListener('loadedmetadata', handleMetadataLoaded);
        element.removeEventListener('timeupdate', handleTimeUpdate);
        element.removeEventListener('play', handlePlay);
        element.removeEventListener('pause', handlePause);
        element.removeEventListener('ended', handleEnded);
        element.removeEventListener('canplay', handleCanPlay);
        element.removeEventListener('error', handleError);
      }
    };
  }, [
    audioRef, 
    isValidUrl, 
    setDuration, 
    setReady, 
    setCurrentTime, 
    setIsPlaying, 
    onAudioEnded, 
    loadAttempts, 
    setHasError
  ]);
  
  // Skip rendering if URL is invalid
  if (!isValidUrl) return null;
  
  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      preload="auto"
      className="hidden"
    />
  );
};

// Memoize the component to avoid unnecessary re-renders
export default memo(AudioElement);
