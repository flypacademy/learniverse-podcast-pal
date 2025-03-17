
import React, { useEffect, useCallback, useState, useRef } from "react";
import Layout from "@/components/Layout";
import PodcastPlayerContent from "@/components/podcast/PodcastPlayerContent";
import PodcastError from "@/components/podcast/PodcastError";
import PodcastLoading from "@/components/podcast/PodcastLoading";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";

const PodcastPlayer = () => {
  const { toast } = useToast();
  const { podcastId } = useParams<{ podcastId: string }>();
  const audioStore = useAudioStore();
  const [audioInitialized, setAudioInitialized] = useState(false);
  const initializationAttemptedRef = useRef(false);
  
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
    console.log("PodcastPlayer component mounted or updated");
    console.log("Loading state:", loading);
    console.log("Error state:", error);
    console.log("Podcast data:", podcastData);
    console.log("Podcast ID from params:", podcastId);
    
    return () => {
      console.log("PodcastPlayer component unmounting");
    };
  }, [loading, error, podcastData, audioRef, podcastId]);

  // Save podcast metadata to the global store when it's loaded
  useEffect(() => {
    if (podcastData && courseData && !loading) {
      audioStore.setPodcastMeta({
        id: podcastData.id,
        title: podcastData.title,
        courseName: courseData?.title || "Unknown Course",
        image: podcastData.image_url || undefined
      });
    }
  }, [podcastData, courseData, loading, audioStore]);

  // Create and configure audio element when podcast data is loaded
  useEffect(() => {
    if (podcastData?.audio_url && audioRef.current && !initializationAttemptedRef.current) {
      initializationAttemptedRef.current = true;
      
      try {
        console.log("Configuring audio element with URL:", podcastData.audio_url);
        
        // Register with audio store first before manipulating the audio element
        if (podcastId) {
          audioStore.setAudio(audioRef.current, podcastId, {
            id: podcastData.id,
            title: podcastData.title,
            courseName: courseData?.title || "Unknown Course",
            image: podcastData.image_url || undefined
          });
          
          // Delay setting audioInitialized to avoid immediate re-renders
          setTimeout(() => {
            setAudioInitialized(true);
          }, 0);
        }
      } catch (error) {
        console.error("Error initializing audio:", error);
        toast({
          title: "Error",
          description: "Failed to initialize audio player",
          variant: "destructive"
        });
      }
    }
  }, [podcastData, audioRef, courseData, audioStore, podcastId, toast]);
  
  const handleRetry = useCallback(() => {
    console.log("Retrying podcast fetch...");
    initializationAttemptedRef.current = false;
    setAudioInitialized(false);
    refetchPodcastData();
  }, [refetchPodcastData]);
  
  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      try {
        console.log("Audio metadata loaded, duration:", audioRef.current.duration);
        if (isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
          setDuration(audioRef.current.duration);
          setReady(true);
        } else {
          console.error("Invalid audio duration:", audioRef.current.duration);
          toast({
            title: "Warning",
            description: "Could not determine audio duration",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error in handleAudioLoadedMetadata:", error);
      }
    }
  };
  
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      try {
        if (isFinite(audioRef.current.currentTime)) {
          setCurrentTime(audioRef.current.currentTime);
        }
      } catch (error) {
        console.error("Error in handleAudioTimeUpdate:", error);
      }
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

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = e.target as HTMLAudioElement;
    console.error("Audio error:", target.error);
    const errorMessage = target.error ? 
      `Error code: ${target.error.code}, message: ${target.error.message}` : 
      "Unknown audio error";
    
    toast({
      title: "Audio Error",
      description: errorMessage,
      variant: "destructive"
    });
    initializationAttemptedRef.current = false;
    setAudioInitialized(false);
  };
  
  if (error) {
    return (
      <Layout>
        <PodcastError errorMessage={error} />
      </Layout>
    );
  }
  
  if (loading || !podcastData) {
    return (
      <Layout>
        <PodcastLoading onRetry={handleRetry} />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <PodcastPlayerContent
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
      />
      
      <XPModal 
        show={showXPModal}
        xpAmount={30}
      />
    </Layout>
  );
};

export default PodcastPlayer;
