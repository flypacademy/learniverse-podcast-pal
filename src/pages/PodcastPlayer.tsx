
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import PodcastPlayerContent from "@/components/podcast/PodcastPlayerContent";
import PodcastError from "@/components/podcast/PodcastError";
import PodcastLoading from "@/components/podcast/PodcastLoading";
import XPModal from "@/components/podcast/XPModal";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { useToast } from "@/components/ui/use-toast";

const PodcastPlayer = () => {
  const { toast } = useToast();
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
    
    return () => {
      console.log("PodcastPlayer component unmounting");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [loading, error, podcastData, audioRef]);

  // Create and configure audio element when podcast data is loaded
  useEffect(() => {
    if (podcastData?.audio_url && audioRef.current) {
      // Make sure audio is properly configured
      console.log("Configuring audio element with URL:", podcastData.audio_url);
      audioRef.current.src = podcastData.audio_url;
      audioRef.current.load();
    }
  }, [podcastData, audioRef]);
  
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
        setCurrentTime(audioRef.current.currentTime);
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
  };
  
  return (
    <Layout>
      {error ? (
        <PodcastError errorMessage={error} />
      ) : loading || !podcastData ? (
        <PodcastLoading />
      ) : (
        <>
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
        </>
      )}
    </Layout>
  );
};

export default PodcastPlayer;
