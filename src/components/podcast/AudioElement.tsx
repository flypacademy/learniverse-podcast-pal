
import React, { RefObject, useEffect } from "react";
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
  // Log when the component mounts to track lifecycle
  useEffect(() => {
    console.log("AudioElement mounted with URL:", audioUrl);
    return () => console.log("AudioElement unmounting");
  }, [audioUrl]);
  
  // Handle audio metadata loaded
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      console.log("Audio loaded metadata:", {
        duration: audioRef.current.duration,
        src: audioRef.current.src
      });
      setDuration(audioRef.current.duration);
      setReady(true);
    }
  };
  
  // Handle audio error
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio element error:", e);
    
    // Try to get more specific error info if available
    const target = e.target as HTMLAudioElement;
    const errorCode = target.error ? target.error.code : 'unknown';
    const errorMessage = target.error ? target.error.message : 'Unknown error';
    
    console.error(`Audio error details: code=${errorCode}, message=${errorMessage}`);
    
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
      }}
      preload="auto"
      className="hidden"
    />
  );
};

export default AudioElement;
