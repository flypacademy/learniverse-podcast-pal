
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useAudioStore } from "@/lib/audioContext";
import { toast } from "@/components/ui/use-toast";

const PodcastPlayer = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const navigate = useNavigate();
  const audioStore = useAudioStore();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    console.log("PodcastPlayer rendered with podcastId:", podcastId);
  }, [podcastId]);
  
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
  
  // Register the current podcast with the global audio store
  // But only do it once to avoid infinite updates
  useEffect(() => {
    if (podcastData && courseData && audioRef.current && ready && !audioInitialized) {
      console.log("Registering podcast with global audio store");
      
      try {
        // Only register if it's not the same podcast already playing
        if (audioStore.currentPodcastId !== podcastData.id) {
          audioStore.setAudio(audioRef.current, podcastData.id, {
            id: podcastData.id,
            title: podcastData.title,
            courseName: courseData.title,
            image: podcastData.image_url || courseData.image
          });
        }
        
        setAudioInitialized(true);
      } catch (err) {
        console.error("Error registering audio with store:", err);
        setHasError(true);
      }
    }
    
    // Cleanup function
    return () => {
      console.log("PodcastPlayer component unmounting, but keeping audio in global store");
    };
  }, [podcastData, courseData, audioRef, ready, audioStore, audioInitialized]);
  
  // Debug logs to help diagnose issues
  useEffect(() => {
    console.log("PodcastPlayer render state:", { 
      loading, 
      error, 
      podcastDataExists: !!podcastData,
      courseDataExists: !!courseData,
      ready,
      podcastId,
      audioInitialized,
      hasError
    });
  }, [loading, error, podcastData, courseData, ready, podcastId, audioInitialized, hasError]);
  
  // If there's an error, show it
  if (error || hasError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="text-gray-600 mt-2">{error || "Failed to load audio player"}</p>
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
  
  return (
    <Layout>
      <div className="space-y-8 pb-32 animate-slide-up">
        <PodcastHeader 
          courseName={courseData?.title || ""}
        />
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 w-full md:w-auto">
            <PodcastCover 
              image={podcastData.image_url || courseData?.image || ""}
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
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  console.log("Audio loaded metadata:", {
                    duration: audioRef.current.duration,
                    src: audioRef.current.src
                  });
                  setDuration(audioRef.current.duration);
                  setReady(true);
                }
              }}
              onError={(e) => {
                console.error("Audio element error:", e);
                setHasError(true);
                toast({
                  title: "Error",
                  description: "Failed to load audio",
                  variant: "destructive"
                });
              }}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onEnded={handleAudioEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onCanPlay={() => {
                console.log("Audio is ready to play");
              }}
              preload="auto"
              className="hidden"
            />
            
            <div className="space-y-4">
              <PlayerControls 
                isPlaying={isPlaying}
                onPlayPause={handlePlayAction}
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
