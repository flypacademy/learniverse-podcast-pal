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
      
      // Pause it to prevent multiple playback - BUT don't use pause() directly
      // as it might trigger unnecessary state updates
      try {
        console.log("Transferring playback to new audio element");
        if (wasPlaying) {
          storeAudioRef.pause(); // Pause without updating global state
        }
      } catch (error) {
        console.error("Error handling existing audio:", error);
      }
      
      // Transfer the current playback position to the new audio element
      if (audioRef.current && isFinite(currentPosition)) {
        audioRef.current.currentTime = currentPosition;
        
        // If it was playing, prepare to auto-play but don't start yet
        // This will be handled by the audio store during setAudio
        if (wasPlaying && audioRef.current) {
          // Keep track that it was playing for later
          audioRef.current.dataset.shouldAutoPlay = "true";
        }
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
        
        // Mark for auto-play without actually playing it yet
        // This avoids the delay when transitioning
        if (wasPlaying) {
          audioRef.current.dataset.shouldAutoPlay = "true";
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
