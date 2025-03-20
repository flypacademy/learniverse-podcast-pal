
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { useAudioStore } from "@/lib/audioContext";
import { useAudioInitialization } from "@/hooks/podcast/useAudioInitialization";
import { useAudioEventHandlers } from "@/hooks/podcast/useAudioEventHandlers";
import PodcastPlayerContainer from "@/components/podcast/PodcastPlayerContainer";
import { XP_AMOUNTS } from "@/utils/xpUtils";
import { XPReason } from "@/types/xp";

const PodcastPlayer = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const audioStore = useAudioStore();
  const componentMountedRef = useRef(true);
  const [xpEarned, setXpEarned] = useState(XP_AMOUNTS.PODCAST_COMPLETION);
  
  const {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    setReady,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
    isQuizAvailable,
    showXPModal,
    setShowXPModal,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
    refetchPodcastData,
    handleCompletion
  } = usePodcastPlayer();
  
  useEffect(() => {
    componentMountedRef.current = true;
    console.log("PodcastPlayer component mounted, showXPModal:", showXPModal);
    
    return () => {
      console.log("PodcastPlayer component unmounting, showXPModal:", showXPModal);
      componentMountedRef.current = false;
    };
  }, [showXPModal]);
  
  const {
    audioInitialized,
    setAudioInitialized,
    initializationAttemptedRef
  } = useAudioInitialization({
    podcastId,
    podcastData,
    courseData,
    audioRef,
    loading
  });

  const {
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError,
    handleRetry
  } = useAudioEventHandlers({
    audioRef,
    setDuration,
    setReady,
    setCurrentTime,
    setIsPlaying,
    handleCompletion,
    setAudioInitialized,
    initializationAttemptedRef
  });
  
  useEffect(() => {
    console.log("PodcastPlayer component mounted or updated");
    console.log("Loading state:", loading);
    console.log("Error state:", error);
    console.log("Podcast data:", podcastData);
    console.log("Podcast ID from params:", podcastId);
    
    return () => {
      console.log("PodcastPlayer component unmounting");
    };
  }, [loading, error, podcastData, audioRef, podcastId]);
  
  const handlePodcastEnded = async () => {
    console.log("Podcast ended - handling completion");
    const success = await handleCompletion();
    if (success && componentMountedRef.current) {
      console.log("Setting XP modal to show with completion XP:", XP_AMOUNTS.PODCAST_COMPLETION);
      setXpEarned(XP_AMOUNTS.PODCAST_COMPLETION);
      setShowXPModal(true);
      
      // Auto-hide XP modal after 5 seconds
      setTimeout(() => {
        if (componentMountedRef.current) {
          setShowXPModal(false);
        }
      }, 5000);
    }
  };
  
  const combinedHandleRetry = () => {
    handleRetry();
    refetchPodcastData();
  };
  
  // Handle audio ended events to show XP modal
  useEffect(() => {
    const handleEnded = () => {
      console.log("Audio ended event detected");
      handlePodcastEnded();
    };
    
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioRef.current]);
  
  return (
    <>
      <PodcastPlayerContainer
        loading={loading}
        error={error}
        podcastData={podcastData}
        courseData={courseData}
        ready={ready}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isQuizAvailable={isQuizAvailable}
        audioRef={audioRef}
        togglePlayPause={togglePlayPause}
        seek={seek}
        changeVolume={changeVolume}
        skipForward={skipForward}
        skipBackward={skipBackward}
        handleAudioLoadedMetadata={handleAudioLoadedMetadata}
        handleAudioTimeUpdate={handleAudioTimeUpdate}
        handleAudioEnded={handlePodcastEnded} // Use our new handler
        handleAudioPlay={handleAudioPlay}
        handleAudioPause={handleAudioPause}
        handleAudioError={handleAudioError}
        handleRetry={combinedHandleRetry}
      />
      
      <XPModal 
        show={showXPModal}
        xpAmount={xpEarned}
        reason={XPReason.PODCAST_COMPLETION}
      />
    </>
  );
};

export default PodcastPlayer;
