
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
  const srcChangedRef = useRef(false);
  const initializedRef = useRef(false);
  
  // Set up the audio element and register it with the store
  useEffect(() => {
    if (!audioRef.current || !src || !podcastId) return;
    
    // Only update the source if it has changed
    if (prevSrcRef.current !== src) {
      console.log("PodcastAudio: Source changed, loading new audio", src);
      audioRef.current.src = src;
      audioRef.current.load();
      srcChangedRef.current = true;
      prevSrcRef.current = src;
    }
    
    // Register with the audio store (do this every time to ensure we're registered)
    if (podcastMeta) {
      console.log("PodcastAudio: Registering with audio store", podcastId);
      audioStore.setAudio(audioRef.current, podcastId, {
        id: podcastId,
        title: podcastMeta.title,
        courseName: podcastMeta.courseName,
        image: podcastMeta.image
      });

      // Mark as initialized
      initializedRef.current = true;

      // Add a log to confirm the podcast is registered
      console.log("PodcastAudio: Audio registered successfully", {
        id: podcastId,
        title: podcastMeta.title,
        image: podcastMeta.image,
        currentPodcastId: audioStore.currentPodcastId
      });
    } else {
      audioStore.setAudio(audioRef.current, podcastId);
      console.log("PodcastAudio: Audio registered without metadata", podcastId);
    }
    
    // Clean up
    return () => {
      console.log("PodcastAudio: Component unmounting, but not cleaning up audio store");
      // We don't clean up the store here because we want the audio to continue
      // playing in the mini player when navigating away
    };
  }, [src, audioRef, audioStore, podcastId, podcastMeta]);

  // Double-check initialization
  useEffect(() => {
    // If we've been mounted for a second and still don't see ourselves in the store,
    // try to register again
    const checkTimer = setTimeout(() => {
      if (audioRef.current && podcastId && podcastMeta && initializedRef.current) {
        const storeState = audioStore.currentPodcastId;
        if (storeState !== podcastId) {
          console.log("PodcastAudio: Re-registering with audio store after timeout", {
            currentInStore: storeState,
            ourId: podcastId
          });
          audioStore.setAudio(audioRef.current, podcastId, {
            id: podcastId,
            title: podcastMeta.title,
            courseName: podcastMeta.courseName,
            image: podcastMeta.image
          });
        }
      }
    }, 1000);
    
    return () => clearTimeout(checkTimer);
  }, [audioRef, audioStore, podcastId, podcastMeta]);

  return null; // This is just a wrapper, it doesn't render anything
};

export default PodcastAudio;
