
import React, { memo, useCallback } from "react";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";
import PlayerControls from "./PlayerControls";
import AudioProgress from "./AudioProgress";
import VolumeControl from "./VolumeControl";
import QuizButton from "./QuizButton";
import { PodcastData, CourseData } from "@/types/podcast";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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
  
  // Handle play button click with error logging
  const onPlayButtonClick = useCallback(() => {
    console.log("PlayerContent: Play button clicked, current playing state:", isPlaying);
    try {
      handlePlayAction();
    } catch (error) {
      console.error("Error in play button handler:", error);
      toast({
        title: "Playback error",
        description: "Could not play audio. Please try again.",
        variant: "destructive"
      });
    }
  }, [isPlaying, handlePlayAction]);
  
  // Safe handling of seek with error capture
  const handleSeek = useCallback((time: number) => {
    try {
      seek(time);
    } catch (error) {
      console.error("Error in seek handler:", error);
    }
  }, [seek]);
  
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
            onPlayPause={onPlayButtonClick}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
            size="normal"
          />
          
          {duration > 0 && (
            <AudioProgress 
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
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
    Math.abs(prevProps.currentTime - nextProps.currentTime) < 0.5 &&
    prevProps.duration === nextProps.duration &&
    prevProps.volume === nextProps.volume &&
    prevProps.podcastData?.id === nextProps.podcastData?.id
  );
});
