
import React, { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";

interface PodcastAudioProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
}

const PodcastAudio = ({
  audioRef,
  src
}: PodcastAudioProps) => {
  const prevSrcRef = useRef<string | undefined>(undefined);
  const audioStore = useAudioStore();
  const sourceUpdateAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Reset source update flag when source changes
    if (prevSrcRef.current !== src) {
      sourceUpdateAttemptedRef.current = false;
    }
    
    // Check if there's already an audio element in the store with a different ref
    const storeAudioRef = audioStore.audioElement;
    if (storeAudioRef && storeAudioRef !== audioRef.current && storeAudioRef.src) {
      // We have a different audio element in the store - preserve its playing state
      const wasPlaying = !storeAudioRef.paused;
      const currentPosition = storeAudioRef.currentTime;
      
      // Pause it to prevent multiple playback
      try {
        console.log("Pausing existing audio element to prevent double playback");
        storeAudioRef.pause();
      } catch (error) {
        console.error("Error pausing existing audio:", error);
      }
      
      // Transfer the current playback position to the new audio element
      if (audioRef.current && isFinite(currentPosition)) {
        audioRef.current.currentTime = currentPosition;
      }
    }
    
    // Only update the source if it's different from the previous one
    // and if we have both a valid reference and source
    if (
      audioRef.current && 
      src && 
      prevSrcRef.current !== src && 
      !sourceUpdateAttemptedRef.current
    ) {
      try {
        console.log("Audio component: setting source to", src);
        sourceUpdateAttemptedRef.current = true;
        
        // If this audio is already registered in the store with the same src, don't reload
        if (audioStore.audioElement === audioRef.current && audioStore.audioElement.src === src) {
          console.log("Audio already loaded with this source, skipping reload");
          return;
        }
        
        // Get the current playing state and time before changing source
        const wasPlaying = audioStore.isPlaying;
        const currentTime = audioStore.currentTime;
        
        // Set the src and load the audio
        audioRef.current.src = src;
        audioRef.current.load();
        
        // Preserve current time when returning to the same podcast
        if (audioStore.currentPodcastId && currentTime > 0) {
          console.log("Preserving audio position at:", currentTime);
          audioRef.current.currentTime = currentTime;
        } else {
          // Reset current time to 0 when loading a new audio
          audioRef.current.currentTime = 0;
        }
        
        prevSrcRef.current = src;
        
        // Auto-resume if it was playing before
        if (wasPlaying && audioRef.current) {
          setTimeout(() => {
            if (audioRef.current) {
              console.log("Auto-resuming playback after source change");
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn("Could not auto-play after source change:", error);
                });
              }
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error setting audio source:", error);
      }
    }
  }, [src, audioRef, audioStore]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
    />
  );
};

export default PodcastAudio;
