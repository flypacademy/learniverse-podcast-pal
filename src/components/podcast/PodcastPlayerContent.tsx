
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PodcastHeader from "./PodcastHeader";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";
import AudioProgress from "./AudioProgress";
import PlayerControls from "./PlayerControls";
import VolumeControl from "./VolumeControl";
import PodcastDescription from "./PodcastDescription";
import QuizButton from "./QuizButton";
import PodcastAudio from "./PodcastAudio";
import PodcastAudioEvents from "./PodcastAudioEvents";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-col space-y-6">
      {/* Back button and course name */}
      <div className="flex items-center justify-between">
        <Link to={`/course/${podcastData.course_id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="text-sm font-medium">
          {courseData?.title || "Course"}
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Podcast header (Now Playing) */}
      <PodcastHeader title={podcastData.title} />
      
      {/* Podcast cover art */}
      <PodcastCover 
        imageUrl={podcastData.image_url} 
        title={podcastData.title}
        isPlaying={isPlaying} 
      />
      
      {/* Podcast info (title, course) */}
      <PodcastInfo 
        title={podcastData.title} 
        courseName={courseData?.title || "Course"} 
      />
      
      {/* Audio player controls */}
      <div className="space-y-6">
        <AudioProgress 
          currentTime={currentTime} 
          duration={duration} 
          onSeek={seek}
        />
        
        <PlayerControls 
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onSkipBack={skipBackward}
          onSkipForward={skipForward}
          disabled={!ready}
        />
        
        <VolumeControl 
          volume={volume} 
          onChange={changeVolume} 
        />
      </div>
      
      {/* Audio element with event handlers */}
      <PodcastAudioEvents
        handleAudioLoadedMetadata={handleAudioLoadedMetadata}
        handleAudioTimeUpdate={handleAudioTimeUpdate}
        handleAudioEnded={handleAudioEnded}
        handleAudioPlay={handleAudioPlay}
        handleAudioPause={handleAudioPause}
        handleAudioError={handleAudioError}
        audioRef={audioRef}
      >
        <PodcastAudio 
          audioRef={audioRef}
          src={podcastData.audio_url}
        />
      </PodcastAudioEvents>
      
      {/* About this episode section */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <PodcastDescription 
          title="About this episode"
          description={podcastData.description || "Learn more about this topic."}
        />
      </div>
      
      {/* Quiz button if available */}
      {isQuizAvailable && (
        <QuizButton podcastId={podcastData.id} />
      )}
    </div>
  );
};

export default PodcastPlayerContent;
