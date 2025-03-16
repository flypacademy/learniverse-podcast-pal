
import React, { memo } from "react";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";
import PlayerControls from "./PlayerControls";
import AudioProgress from "./AudioProgress";
import VolumeControl from "./VolumeControl";
import QuizButton from "./QuizButton";
import { PodcastData, CourseData } from "@/types/podcast";
import { useNavigate } from "react-router-dom";

interface PlayerContentProps {
  podcastData: PodcastData;
  courseData: CourseData | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isQuizAvailable: boolean;
  handlePlayAction: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  seek: (time: number) => void;
  changeVolume: (volume: number) => void;
}

const PlayerContent = ({
  podcastData,
  courseData,
  isPlaying,
  currentTime,
  duration,
  volume,
  isQuizAvailable,
  handlePlayAction,
  skipBackward,
  skipForward,
  seek,
  changeVolume
}: PlayerContentProps) => {
  const navigate = useNavigate();
  
  // Safe rendering of podcast content
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-shrink-0 w-full md:w-auto">
        <PodcastCover 
          image={podcastData?.image_url || (courseData?.image || "")}
          title={podcastData?.title || ""} 
        />
      </div>
      
      <div className="flex-grow space-y-6">
        <PodcastInfo 
          title={podcastData?.title || ""}
          courseName={courseData?.title || ""}
        />
        
        <div className="space-y-6">
          <PlayerControls 
            isPlaying={isPlaying}
            onPlayPause={handlePlayAction}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
            size="normal"
          />
          
          {duration > 0 && (
            <AudioProgress 
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
          )}
          
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
  );
};

// Use React.memo with a custom comparison function to prevent unnecessary re-renders
export default memo(PlayerContent, (prevProps, nextProps) => {
  // Only re-render if any of these props have changed
  return (
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.currentTime === nextProps.currentTime &&
    prevProps.duration === nextProps.duration &&
    prevProps.volume === nextProps.volume &&
    prevProps.podcastData?.id === nextProps.podcastData?.id
  );
});
