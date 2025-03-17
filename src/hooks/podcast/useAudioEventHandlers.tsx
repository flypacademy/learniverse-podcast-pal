
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useAudioEventHandlers({
  audioRef,
  setDuration,
  setReady,
  setCurrentTime,
  setIsPlaying,
  handleCompletion,
  setAudioInitialized,
  initializationAttemptedRef
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  setDuration: (duration: number) => void;
  setReady: (ready: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  handleCompletion: () => void;
  setAudioInitialized: (initialized: boolean) => void;
  initializationAttemptedRef: React.MutableRefObject<boolean>;
}) {
  const { toast } = useToast();
  
  const handleAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      try {
        console.log("Audio metadata loaded, duration:", audioRef.current.duration);
        if (isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
          setDuration(audioRef.current.duration);
          setReady(true);
        } else {
          console.error("Invalid audio duration:", audioRef.current.duration);
          toast({
            title: "Warning",
            description: "Could not determine audio duration",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error in handleAudioLoadedMetadata:", error);
      }
    }
  }, [audioRef, setDuration, setReady, toast]);
  
  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      try {
        if (isFinite(audioRef.current.currentTime)) {
          setCurrentTime(audioRef.current.currentTime);
        }
      } catch (error) {
        console.error("Error in handleAudioTimeUpdate:", error);
      }
    }
  }, [audioRef, setCurrentTime]);
  
  const handleAudioEnded = useCallback(() => {
    console.log("Audio playback ended");
    handleCompletion();
  }, [handleCompletion]);
  
  const handleAudioPlay = useCallback(() => {
    console.log("Audio started playing");
    setIsPlaying(true);
  }, [setIsPlaying]);
  
  const handleAudioPause = useCallback(() => {
    console.log("Audio paused");
    setIsPlaying(false);
  }, [setIsPlaying]);

  const handleAudioError = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    console.error("Audio error:", target.error);
    const errorMessage = target.error ? 
      `Error code: ${target.error.code}, message: ${target.error.message}` : 
      "Unknown audio error";
    
    toast({
      title: "Audio Error",
      description: errorMessage,
      variant: "destructive"
    });
    initializationAttemptedRef.current = false;
    setAudioInitialized(false);
  }, [toast, initializationAttemptedRef, setAudioInitialized]);

  const handleRetry = useCallback(() => {
    console.log("Retrying podcast fetch...");
    initializationAttemptedRef.current = false;
    setAudioInitialized(false);
  }, [initializationAttemptedRef, setAudioInitialized]);

  return {
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError,
    handleRetry
  };
}
