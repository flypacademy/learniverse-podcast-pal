
import React, { useEffect, useCallback } from "react";

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
  // Create a wrapper function to handle the error event
  const handleErrorEvent = useCallback((event: Event) => {
    // Convert the native event to something compatible with React's synthetic event
    const syntheticEvent = {
      nativeEvent: event,
      currentTarget: event.currentTarget,
      target: event.target,
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      defaultPrevented: event.defaultPrevented,
      eventPhase: event.eventPhase,
      isTrusted: event.isTrusted,
      timeStamp: event.timeStamp,
      type: event.type,
      preventDefault: () => event.preventDefault(),
      stopPropagation: () => event.stopPropagation(),
      isPropagationStopped: () => false,
      isDefaultPrevented: () => event.defaultPrevented,
      persist: () => {}
    } as React.SyntheticEvent<HTMLAudioElement, Event>;
    
    handleAudioError(syntheticEvent);
  }, [handleAudioError]);

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
    audioElement.addEventListener('error', handleErrorEvent);
    
    // Clean up on unmount
    return () => {
      console.log("PodcastAudioEvents: Removing event listeners from audio element");
      audioElement.removeEventListener('loadedmetadata', handleAudioLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleAudioTimeUpdate);
      audioElement.removeEventListener('ended', handleAudioEnded);
      audioElement.removeEventListener('play', handleAudioPlay);
      audioElement.removeEventListener('pause', handleAudioPause);
      audioElement.removeEventListener('error', handleErrorEvent);
    };
  }, [audioRef, handleAudioLoadedMetadata, handleAudioTimeUpdate, handleAudioEnded, 
      handleAudioPlay, handleAudioPause, handleErrorEvent]);
  
  return <>{children}</>;
};

export default PodcastAudioEvents;
