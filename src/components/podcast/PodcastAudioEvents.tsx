
import React, { useEffect } from "react";

interface PodcastAudioEventsProps {
  handleAudioLoadedMetadata: () => void;
  handleAudioTimeUpdate: () => void;
  handleAudioEnded: () => void;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  children: React.ReactNode;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const PodcastAudioEvents = ({
  handleAudioLoadedMetadata,
  handleAudioTimeUpdate,
  handleAudioEnded,
  handleAudioPlay,
  handleAudioPause,
  handleAudioError,
  audioRef,
  children
}: PodcastAudioEventsProps) => {
  // Attach event listeners directly to the audio element
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    console.log("PodcastAudioEvents: Attaching event listeners to audio element");
    
    // Add event listeners
    audioElement.addEventListener('loadedmetadata', handleAudioLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleAudioTimeUpdate);
    audioElement.addEventListener('ended', handleAudioEnded);
    audioElement.addEventListener('play', handleAudioPlay);
    audioElement.addEventListener('pause', handleAudioPause);
    audioElement.addEventListener('error', handleAudioError as EventListener);
    
    // Clean up on unmount
    return () => {
      console.log("PodcastAudioEvents: Removing event listeners from audio element");
      audioElement.removeEventListener('loadedmetadata', handleAudioLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleAudioTimeUpdate);
      audioElement.removeEventListener('ended', handleAudioEnded);
      audioElement.removeEventListener('play', handleAudioPlay);
      audioElement.removeEventListener('pause', handleAudioPause);
      audioElement.removeEventListener('error', handleAudioError as EventListener);
    };
  }, [audioRef, handleAudioLoadedMetadata, handleAudioTimeUpdate, handleAudioEnded, 
      handleAudioPlay, handleAudioPause, handleAudioError]);
  
  return <>{children}</>;
};

export default PodcastAudioEvents;
