
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
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const isUnmountedRef = useRef(false);
  
  // Cleanup function for all resources
  const cleanup = () => {
    isUnmountedRef.current = true;
    hasSetupEvents.current = false;
    
    // Clear the interval if it exists
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
    
    // Clean up the audio element
    if (audioRef.current) {
      // Don't call pause() - we want playback to continue in the global store
    }
  };
  
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
    
    // Set up a regular interval for time updates
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (isUnmountedRef.current) return;
      
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 250);
    
    return cleanup;
  }, [audioUrl, setHasError, audioRef, setCurrentTime]);
  
  // This useEffect sets up the event listeners only once
  useEffect(() => {
    if (!isValidUrl || !audioRef.current || hasSetupEvents.current || isUnmountedRef.current) return;
    
    const element = audioRef.current;
    
    // Attach event listeners
    const handleMetadataLoaded = () => {
      if (element && !isUnmountedRef.current) {
        console.log("Audio loaded metadata:", {
          duration: element.duration,
          src: element.src
        });
        setDuration(element.duration || 0);
        setReady(true);
        setLoadAttempts(0);
      }
    };
    
    const handleTimeUpdate = () => {
      if (element && !isUnmountedRef.current) {
        // Throttle time updates to reduce re-renders
        if (Math.abs(element.currentTime - lastTimeUpdateRef.current) >= 0.5) {
          lastTimeUpdateRef.current = element.currentTime;
          setCurrentTime(element.currentTime);
        }
      }
    };
    
    const handlePlay = () => {
      if (!isUnmountedRef.current) setIsPlaying(true);
    };
    
    const handlePause = () => {
      if (!isUnmountedRef.current) setIsPlaying(false);
    };
    
    const handleEnded = () => {
      if (!isUnmountedRef.current) {
        setIsPlaying(false);
        onAudioEnded();
      }
    };
    
    const handleCanPlay = () => {
      if (!isUnmountedRef.current) {
        console.log("Audio is ready to play");
        setReady(true);
      }
    };
    
    const handleError = (e: Event) => {
      if (isUnmountedRef.current) return;
      
      console.error("Direct audio element error:", e);
      const target = e.target as HTMLAudioElement;
      const errorCode = target.error ? target.error.code : 'unknown';
      const errorMessage = target.error ? target.error.message : 'Unknown error';
      
      console.error(`Direct audio error details: code=${errorCode}, message=${errorMessage}`);
      
      // Retry logic with increasing backoff
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        const retryDelay = 1000 * (loadAttempts + 1);
        
        setTimeout(() => {
          if (!isUnmountedRef.current && element) {
            console.log(`Retry attempt ${loadAttempts + 1} for audio load`);
            try {
              element.load();
            } catch (err) {
              console.error("Error reloading audio:", err);
            }
          }
        }, retryDelay);
      } else {
        setHasError(true);
        toast({
          title: "Audio Error",
          description: "Could not load audio file",
          variant: "destructive"
        });
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
  
  // If URL is invalid, don't render audio element
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

// Memoize to prevent unnecessary re-renders
export default memo(AudioElement);
