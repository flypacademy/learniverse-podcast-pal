
import React, { useEffect } from "react";
import { XPReason } from "@/types/xp";
import { usePodcastData } from "@/hooks/usePodcastData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { usePodcastPlayerState } from "@/hooks/podcast/usePodcastPlayerState";
import XPModal from "@/components/podcast/XPModal";
import ErrorState from "@/components/podcast/ErrorState";
import LoadingState from "@/components/podcast/LoadingState";
import PodcastPlayerLayout from "@/components/podcast/PodcastPlayerLayout";
import PlayerCard from "@/components/podcast/PlayerCard";
import DescriptionCard from "@/components/podcast/DescriptionCard";

const PodcastPlayer = () => {
  // Get podcast data
  const { 
    podcastId, 
    podcastData, 
    courseData, 
    loading, 
    error, 
    isQuizAvailable 
  } = usePodcastData();
  
  // Initialize audio player
  const {
    isLoading: audioLoading,
    isPlaying,
    duration,
    currentTime,
    volume,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    changeVolume,
    setCurrentTime
  } = useAudioPlayer(podcastData?.audio_url);
  
  // Initialize progress tracking
  const {
    saveProgress,
    handleCompletion,
    loadProgress
  } = useProgressTracking(
    podcastId,
    audioRef.current,
    isPlaying,
    duration,
    currentTime,
    podcastData?.course_id
  );
  
  // Initialize player state management
  const {
    showXPModal,
    setShowXPModal,
    initialPositionSet,
    setInitialPositionSet
  } = usePodcastPlayerState(
    podcastData,
    audioRef,
    saveProgress,
    handleCompletion
  );
  
  // Load saved progress when podcast data loads
  useEffect(() => {
    async function restoreProgress() {
      if (podcastData && !initialPositionSet) {
        try {
          const savedProgress = await loadProgress();
          
          if (savedProgress && savedProgress.last_position > 0 && audioRef.current) {
            console.log("Restoring saved position:", savedProgress.last_position);
            audioRef.current.currentTime = savedProgress.last_position;
            setCurrentTime(savedProgress.last_position);
          }
          
          setInitialPositionSet(true);
        } catch (err) {
          console.error("Error loading saved progress:", err);
        }
      }
    }
    
    restoreProgress();
  }, [podcastData, audioRef.current, initialPositionSet]);
  
  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  if (loading || !podcastData) {
    return <LoadingState />;
  }
  
  // Get cover image
  const coverImage = podcastData.image_url || courseData?.image || "";
  
  return (
    <PodcastPlayerLayout courseData={courseData} courseId={podcastData.course_id}>
      {/* Main content card */}
      <PlayerCard 
        podcastData={podcastData}
        courseData={courseData}
        coverImage={coverImage}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        audioLoading={audioLoading}
        volume={volume}
        progressPercent={progressPercent}
        togglePlayPause={togglePlayPause}
        seek={seek}
        skipBackward={skipBackward}
        skipForward={skipForward}
        changeVolume={changeVolume}
      />
      
      {/* About this episode section and quiz button */}
      <DescriptionCard 
        description={podcastData.description || "Learn more about this topic."}
        isQuizAvailable={isQuizAvailable}
        podcastId={podcastData.id}
      />
      
      {/* Create an audio element */}
      <audio
        ref={audioRef}
        src={podcastData.audio_url}
        preload="metadata"
        onTimeUpdate={() => saveProgress()}
        style={{ display: 'none' }}
      />
      
      {/* XP Modal */}
      <XPModal 
        show={showXPModal}
        xpAmount={50}
        reason={XPReason.PODCAST_COMPLETION}
      />
    </PodcastPlayerLayout>
  );
};

export default PodcastPlayer;
