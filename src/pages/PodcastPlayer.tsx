
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import PodcastHeader from "@/components/podcast/PodcastHeader";
import PodcastDescription from "@/components/podcast/PodcastDescription";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { toast } from "@/components/ui/use-toast";
import AudioElement from "@/components/podcast/AudioElement";
import PlayerContent from "@/components/podcast/PlayerContent";
import PodcastLoading from "@/components/podcast/PodcastLoading";
import PodcastError from "@/components/podcast/PodcastError";
import AudioRegistration from "@/components/podcast/AudioRegistration";

const PodcastPlayer = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [hasError, setHasError] = useState(false);
  
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
    handleCompletion
  } = usePodcastPlayer();
  
  // Debug logs to help diagnose issues
  React.useEffect(() => {
    console.log("PodcastPlayer render state:", { 
      loading, 
      error, 
      podcastDataExists: !!podcastData,
      courseDataExists: !!courseData,
      ready,
      podcastId,
      hasError
    });
  }, [loading, error, podcastData, courseData, ready, podcastId, hasError]);
  
  const handleAudioEnded = () => {
    handleCompletion();
  };
  
  const handlePlayAction = () => {
    try {
      togglePlayPause();
    } catch (err) {
      console.error("Error in play action:", err);
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // If there's an error, show error component
  if (error || hasError) {
    return (
      <Layout>
        <PodcastError error={error} />
      </Layout>
    );
  }
  
  // Show loading state
  if (loading || !podcastData) {
    return (
      <Layout>
        <PodcastLoading />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-8 pb-32 animate-slide-up">
        <PodcastHeader courseName={courseData?.title || ""} />
        
        {/* Audio element and global audio store registration */}
        <AudioElement 
          audioRef={audioRef}
          audioUrl={podcastData.audio_url}
          setDuration={setDuration}
          setReady={setReady}
          setCurrentTime={setCurrentTime}
          setIsPlaying={setIsPlaying}
          onAudioEnded={handleAudioEnded}
          setHasError={setHasError}
        />
        
        <AudioRegistration 
          audioRef={audioRef}
          podcastData={podcastData}
          courseData={courseData}
          ready={ready}
          setHasError={setHasError}
        />
        
        {/* Main player content */}
        <PlayerContent 
          podcastData={podcastData}
          courseData={courseData}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isQuizAvailable={isQuizAvailable}
          handlePlayAction={handlePlayAction}
          skipBackward={skipBackward}
          skipForward={skipForward}
          seek={seek}
          changeVolume={changeVolume}
        />
        
        <PodcastDescription description={podcastData.description || ""} />
      </div>
      
      <XPModal 
        show={showXPModal}
        xpAmount={30}
      />
    </Layout>
  );
};

export default PodcastPlayer;
