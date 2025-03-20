
import React, { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audioContext";

interface PodcastAudioProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
  podcastId?: string;
  podcastMeta?: {
    title: string;
    courseName: string;
    image?: string;
  };
}

const PodcastAudio = ({
  audioRef,
  src,
  podcastId,
  podcastMeta
}: PodcastAudioProps) => {
  const prevSrcRef = useRef<string | undefined>(undefined);
  const audioStore = useAudioStore();
  const initializedRef = useRef(false);
  
  // Set up the audio element and register it with the store
  useEffect(() => {
    if (!audioRef.current || !src || !podcastId) return;
    
    // Only update the source if it has changed
    if (prevSrcRef.current !== src) {
      console.log("PodcastAudio: Source changed, loading new audio", src);
      audioRef.current.src = src;
      audioRef.current.load();
      prevSrcRef.current = src;
    }
    
    // Register with the audio store
    if (podcastMeta && !initializedRef.current) {
      console.log("PodcastAudio: Registering with audio store", podcastId);
      initializedRef.current = true;
      
      audioStore.setAudio(audioRef.current, podcastId, {
        id: podcastId,
        title: podcastMeta.title,
        courseName: podcastMeta.courseName,
        image: podcastMeta.image
      });

      // Add a log to confirm registration
      console.log("PodcastAudio: Audio registered successfully", {
        id: podcastId,
        title: podcastMeta.title,
        currentPodcastId: audioStore.currentPodcastId
      });
    }
    
    // IMPORTANT: Do NOT clean up audio on unmount
    return () => {
      console.log("PodcastAudio: Component unmounting, KEEPING audio in store");
    };
  }, [src, audioRef, audioStore, podcastId, podcastMeta]);

  return null; // This is just a wrapper, it doesn't render anything
};

export default PodcastAudio;
