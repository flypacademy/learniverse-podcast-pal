
import { useEffect, useCallback } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { useToast } from "@/components/ui/use-toast";

export function usePodcastEventHandlers(
  audioRef: React.RefObject<HTMLAudioElement>,
  setDuration: (duration: number) => void,
  setCurrentTime: (time: number) => void,
  setReady: (ready: boolean) => void,
  handleCompletion: () => Promise<boolean>,
  setShowXPModal: (show: boolean) => void
) {
  const { toast } = useToast();
  
  // Event handlers for audio element
  const handleAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      console.log("Audio metadata loaded, duration:", audioDuration);
      setDuration(audioDuration);
      setReady(true);
    }
  }, [audioRef, setDuration, setReady]);
  
  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [audioRef, setCurrentTime]);
  
  const handleAudioEnded = useCallback(() => {
    handleCompletion().then(success => {
      if (success) {
        setShowXPModal(true);
        setTimeout(() => setShowXPModal(false), 5000);
      }
    });
  }, [handleCompletion, setShowXPModal]);
  
  const handleAudioPlay = useCallback(() => {
    console.log("Play called");
  }, []);
  
  const handleAudioPause = useCallback(() => {
    // This is handled by the audio store pause() method
  }, []);
  
  const handleAudioError = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error("Audio error:", e);
    toast({
      title: "Playback Error",
      description: "There was an error playing this podcast. Please try again.",
      variant: "destructive"
    });
  }, [toast]);

  return {
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError
  };
}
