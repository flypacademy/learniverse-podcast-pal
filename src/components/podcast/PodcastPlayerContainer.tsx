
import React from "react";
import Layout from "@/components/Layout";
import PodcastPlayerContent from "@/components/podcast/PodcastPlayerContent";
import PodcastError from "@/components/podcast/PodcastError";
import PodcastLoading from "@/components/podcast/PodcastLoading";
import { PodcastData, CourseData } from "@/types/podcast";

interface PodcastPlayerContainerProps {
  loading: boolean;
  error: string | null;
  podcastData: PodcastData | null;
  courseData: CourseData | null;
  ready: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isQuizAvailable: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  seek: (percent: number) => void;
  changeVolume: (volume: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  handleAudioLoadedMetadata: () => void;
  handleAudioTimeUpdate: () => void;
  handleAudioEnded: () => void;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  handleRetry: () => void;
}

const PodcastPlayerContainer = ({
  loading,
  error,
  podcastData,
  courseData,
  ready,
  isPlaying,
  currentTime,
  duration,
  volume,
  isQuizAvailable,
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
  handleRetry
}: PodcastPlayerContainerProps) => {
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
    </Layout>
  );
};

export default PodcastPlayerContainer;
