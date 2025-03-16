
import React, { RefObject, useEffect, useState } from "react";
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
  
  // Validate audio URL before attempting to load
  useEffect(() => {
    if (!audioUrl) {
      console.error("Invalid audio URL provided:", audioUrl);
      setHasError(true);
      return;
    }
    
    try {
      // Validate URL format
      new URL(audioUrl);
    } catch (err) {
      console.error("Invalid audio URL format:", audioUrl, err);
      setHasError(true);
      return;
    }
    
    console.log("AudioElement mounted with valid URL:", audioUrl);
    
    return () => console.log("AudioElement unmounting");
  }, [audioUrl, setHasError]);
  
  // Handle audio metadata loaded
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      console.log("Audio loaded metadata:", {
        duration: audioRef.current.duration,
        src: audioRef.current.src
      });
      setDuration(audioRef.current.duration);
      setReady(true);
      // Reset load attempts on successful load
      setLoadAttempts(0);
    }
  };
  
  // Handle audio error with retry logic
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio element error:", e);
    
    // Try to get more specific error info if available
    const target = e.target as HTMLAudioElement;
    const errorCode = target.error ? target.error.code : 'unknown';
    const errorMessage = target.error ? target.error.message : 'Unknown error';
    
    console.error(`Audio error details: code=${errorCode}, message=${errorMessage}`);
    
    // Implement retry logic for recoverable errors (up to 2 retries)
    if (loadAttempts < 2) {
      console.log(`Retrying audio load (attempt ${loadAttempts + 1})`);
      setLoadAttempts(prev => prev + 1);
      
      // Small delay before retry
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
        }
      }, 1000);
      
      return;
    }
    
    setHasError(true);
    toast({
      title: "Error",
      description: "Failed to load audio. Please try again later.",
      variant: "destructive"
    });
  };
  
  // Handle time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      onLoadedMetadata={handleMetadataLoaded}
      onError={handleError}
      onTimeUpdate={handleTimeUpdate}
      onEnded={onAudioEnded}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onCanPlay={() => {
        console.log("Audio is ready to play");
        setReady(true);
      }}
      preload="auto"
      className="hidden"
    />
  );
};

export default AudioElement;
