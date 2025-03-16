
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
  
  const handleAudioEnded = () => {
    handleCompletion();
  };
  
  return (
    <Layout>
      <div className="space-y-8 pb-32 animate-slide-up">
        <PodcastHeader 
          title={podcastData.title} 
          courseName={courseData?.title || ""}
          courseId={courseData?.id || ""}
        />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-auto">
            <PodcastCover 
              src={podcastData.image_url || ""} 
              alt={podcastData.title} 
            />
          </div>
          
          <div className="flex-grow space-y-6">
            <PodcastInfo 
              title={podcastData.title}
              duration={duration}
            />
            
            <audio
              ref={audioRef}
              src={podcastData.audio_url}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                  setReady(true);
                }
              }}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onEnded={handleAudioEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              preload="metadata"
              className="hidden"
            />
            
            <div className="space-y-4">
              <PlayerControls 
                isPlaying={isPlaying}
                handlePlayPause={togglePlayPause}
                handleForward={skipForward}
                handleBackward={skipBackward}
                disabled={!ready}
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
                    podcastId={podcastData.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        <PodcastDescription description={podcastData.description || ""} />
      </div>
      
      {showXPModal && (
        <XPModal 
          onClose={() => setShowXPModal(false)}
          xpEarned={30}
        />
      )}
    </Layout>
  );
};

export default PodcastPlayer;
