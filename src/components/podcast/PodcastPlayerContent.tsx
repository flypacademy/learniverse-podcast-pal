
import React from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import PodcastHeader from "./PodcastHeader";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";
import PlayerControls from "./PlayerControls";
import AudioProgress from "./AudioProgress";
import VolumeControl from "./VolumeControl";
import PodcastDescription from "./PodcastDescription";
import QuizButton from "./QuizButton";
import PodcastAudio from "./PodcastAudio";
import PodcastAudioEvents from "./PodcastAudioEvents";
import { PodcastData, CourseData } from "@/types/podcast";

interface PodcastPlayerContentProps {
  podcastData: PodcastData;
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
}

const PodcastPlayerContent = ({
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
  handleAudioError
}: PodcastPlayerContentProps) => {
  const navigate = useNavigate();

  return (
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
          
          <PodcastAudioEvents
            audioRef={audioRef}
            handleAudioLoadedMetadata={handleAudioLoadedMetadata}
            handleAudioTimeUpdate={handleAudioTimeUpdate}
            handleAudioEnded={handleAudioEnded}
            handleAudioPlay={handleAudioPlay}
            handleAudioPause={handleAudioPause}
            handleAudioError={handleAudioError}
          >
            <PodcastAudio
              audioRef={audioRef}
              src={podcastData.audio_url}
            />
          </PodcastAudioEvents>
          
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
  );
};

export default PodcastPlayerContent;
