
import React from "react";
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
  
  // Use try-catch for error handling during rendering
  try {
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 w-full md:w-auto">
          <PodcastCover 
            image={podcastData.image_url || (courseData?.image || "")}
            title={podcastData.title} 
          />
        </div>
        
        <div className="flex-grow space-y-6">
          <PodcastInfo 
            title={podcastData.title}
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
  } catch (error) {
    console.error("Error rendering player content:", error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Player content could not be displayed</p>
      </div>
    );
  }
};

export default PlayerContent;
