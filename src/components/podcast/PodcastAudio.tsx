
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
      // We have a different audio element in the store - pause it to prevent multiple playback
      try {
        console.log("Pausing existing audio element to prevent double playback");
        storeAudioRef.pause();
      } catch (error) {
        console.error("Error pausing existing audio:", error);
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
        if (storeAudioRef === audioRef.current && storeAudioRef.src === src) {
          console.log("Audio already loaded with this source, skipping reload");
          return;
        }
        
        // Set the src and load the audio
        audioRef.current.src = src;
        audioRef.current.load();
        prevSrcRef.current = src;
      } catch (error) {
        console.error("Error setting audio source:", error);
      }
    }
  }, [src, audioRef, audioStore.audioElement]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      className="hidden"
    />
  );
};

export default PodcastAudio;
