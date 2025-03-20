
import React from "react";
import { Card } from "@/components/ui/card";
import AudioProgress from "./AudioProgress";
import PlayerControls from "./PlayerControls";
import VolumeControl from "./VolumeControl";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";

interface PlayerCardProps {
  podcastData: any;
  courseData: any;
  coverImage: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  audioLoading: boolean;
  volume: number;
  progressPercent: number;
  togglePlayPause: () => void;
  seek: (percent: number) => void;
  skipBackward: () => void;
  skipForward: () => void;
  changeVolume: (value: number) => void;
}

const PlayerCard = ({
  podcastData,
  courseData,
  coverImage,
  currentTime,
  duration,
  isPlaying,
  audioLoading,
  volume,
  progressPercent,
  togglePlayPause,
  seek,
  skipBackward,
  skipForward,
  changeVolume
}: PlayerCardProps) => {
  return (
    <Card className="overflow-hidden bg-white shadow-lg rounded-3xl p-6 border-none">
      {/* Podcast cover art */}
      <PodcastCover 
        image={coverImage} 
        title={podcastData.title}
      />
      
      {/* Podcast info */}
      <PodcastInfo 
        title={podcastData.title} 
        courseName={courseData?.title || "Course"} 
      />
      
      {/* Audio player controls */}
      <div className="space-y-6 mt-6">
        {/* Progress slider */}
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
          disabled={audioLoading}
        />
        
        <VolumeControl 
          volume={volume} 
          onVolumeChange={changeVolume} 
        />
      </div>
    </Card>
  );
};

export default PlayerCard;
