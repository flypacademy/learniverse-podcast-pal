
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { useAudioStore } from "@/lib/audioContext";
import { useAudioInitialization } from "@/hooks/podcast/useAudioInitialization";
import { useAudioEventHandlers } from "@/hooks/podcast/useAudioEventHandlers";
import PodcastPlayerContainer from "@/components/podcast/PodcastPlayerContainer";

const PodcastPlayer = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const audioStore = useAudioStore();
  
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
  
  // Initialize audio handling
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

  // Set up audio event handlers
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
  
  // Component lifecycle logging
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
  
  const combinedHandleRetry = () => {
    handleRetry();
    refetchPodcastData();
  };
  
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
        handleAudioEnded={handleAudioEnded}
        handleAudioPlay={handleAudioPlay}
        handleAudioPause={handleAudioPause}
        handleAudioError={handleAudioError}
        handleRetry={combinedHandleRetry}
      />
      
      <XPModal 
        show={showXPModal}
        xpAmount={30}
      />
    </>
  );
};

export default PodcastPlayer;
