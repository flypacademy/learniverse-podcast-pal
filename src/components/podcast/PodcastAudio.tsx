
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
  
  useEffect(() => {
    // Only update the source if it's different from the previous one
    // and if we have both a valid reference and source
    if (audioRef.current && src && prevSrcRef.current !== src) {
      try {
        console.log("Audio component: setting source to", src);
        
        // If this audio is already registered in the store with the same src, don't reload
        const storeAudioRef = audioStore.audioElement;
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
