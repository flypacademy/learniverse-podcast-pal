
import React from "react";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import PodcastPlayerContainer from "@/components/podcast/PodcastPlayerContainer";
import XPModal from "@/components/podcast/XPModal";
import { XPReason } from "@/types/xp";

const PodcastPlayer = () => {
  // Use the podcast player hook for all functionality
  const {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    isPlaying,
    duration,
    currentTime,
    volume,
    isQuizAvailable,
    showXPModal,
    setShowXPModal,
    audioRef,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
    handleAudioLoadedMetadata,
    handleAudioTimeUpdate,
    handleAudioEnded,
    handleAudioPlay,
    handleAudioPause,
    handleAudioError,
    refetchPodcastData
  } = usePodcastPlayer();
  
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
        handleRetry={refetchPodcastData}
      />
      
      {/* XP Modal */}
      <XPModal 
        show={showXPModal}
        xpAmount={50}
        reason={XPReason.PODCAST_COMPLETION}
      />
    </>
  );
};

export default PodcastPlayer;
