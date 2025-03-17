
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
    if (audioRef.current && src && prevSrcRef.current !== src) {
      try {
        console.log("Audio component: setting source to", src);
        
        // If this audio is already registered in the store with the same src, don't reload
        if (audioRef.current === audioStore.audioElement && audioRef.current.src === src) {
          console.log("Audio already loaded with this source, skipping reload");
          return;
        }
        
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
