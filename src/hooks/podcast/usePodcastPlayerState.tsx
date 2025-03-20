
import { useState, useEffect, useRef } from "react";
import { XPReason } from "@/types/xp";

export function usePodcastPlayerState(
  podcastData: any,
  audioRef: React.RefObject<HTMLAudioElement>,
  saveProgress: (completed?: boolean) => Promise<void>,
  handleCompletion: () => Promise<boolean>
) {
  const [showXPModal, setShowXPModal] = useState(false);
  const [initialPositionSet, setInitialPositionSet] = useState(false);

  // Handle audio ended event
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = async () => {
        console.log("Audio ended, handling completion");
        const success = await handleCompletion();
        if (success) {
          setShowXPModal(true);
          setTimeout(() => setShowXPModal(false), 5000);
        }
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioRef.current, handleCompletion]);
  
  return {
    showXPModal,
    setShowXPModal,
    initialPositionSet,
    setInitialPositionSet
  };
}
