
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PodcastHeader from "@/components/podcast/PodcastHeader";
import PodcastCover from "@/components/podcast/PodcastCover";
import PodcastInfo from "@/components/podcast/PodcastInfo";
import PlayerControls from "@/components/podcast/PlayerControls";
import AudioProgress from "@/components/podcast/AudioProgress";
import VolumeControl from "@/components/podcast/VolumeControl";
import PodcastDescription from "@/components/podcast/PodcastDescription";
import QuizButton from "@/components/podcast/QuizButton";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { Skeleton } from "@/components/ui/skeleton";

const PodcastPlayer = () => {
  const navigate = useNavigate();
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
  
  useEffect(() => {
    console.log("PodcastPlayer component mounted or updated");
    console.log("Loading state:", loading);
    console.log("Error state:", error);
    console.log("Podcast data:", podcastData);
    
    // Add a cleanup function to handle unmounting
    return () => {
      console.log("PodcastPlayer component unmounting");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [loading, error, podcastData]);
  
  // If there's an error, show it
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }
  
  // Show loading state
  if (loading || !podcastData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading podcast...</p>
        </div>
      </Layout>
    );
  }
  
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      console.log("Audio metadata loaded, duration:", audioRef.current.duration);
      setDuration(audioRef.current.duration);
      setReady(true);
    }
  };
  
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleAudioEnded = () => {
    console.log("Audio playback ended");
    handleCompletion();
  };
  
  const handleAudioPlay = () => {
    console.log("Audio started playing");
    setIsPlaying(true);
  };
  
  const handleAudioPause = () => {
    console.log("Audio paused");
    setIsPlaying(false);
  };
  
  return (
    <Layout>
      <div className="space-y-8 pb-32 animate-slide-up">
        <PodcastHeader 
          courseName={courseData?.title || ""}
        />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-auto">
            <PodcastCover 
              image={podcastData.image_url || ""}
              title={podcastData.title} 
            />
          </div>
          
          <div className="flex-grow space-y-6">
            <PodcastInfo 
              title={podcastData.title}
              courseName={courseData?.title || ""}
            />
            
            <audio
              ref={audioRef}
              src={podcastData.audio_url}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              onPlay={handleAudioPlay}
              onPause={handleAudioPause}
              onError={(e) => console.error("Audio error:", e)}
              preload="metadata"
              className="hidden"
            />
            
            <div className="space-y-4">
              {ready ? (
                <>
                  <PlayerControls 
                    isPlaying={isPlaying}
                    onPlayPause={togglePlayPause}
                    onSkipBack={skipBackward}
                    onSkipForward={skipForward}
                    size="normal"
                  />
                  
                  <AudioProgress 
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seek}
                  />
                  
                  <div className="flex justify-between">
                    <VolumeControl 
                      volume={volume}
                      onVolumeChange={changeVolume}
                    />
                    
                    {isQuizAvailable && (
                      <QuizButton 
                        onClick={() => navigate(`/quiz/${podcastData.id}`)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
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
