
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import { formatTime } from "@/lib/utils";
import PlayerControls from "./PlayerControls";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface MiniPlayerProps {
  podcastId: string;
  title: string;
  courseName: string;
  thumbnailUrl?: string;
}

const MiniPlayer = ({ podcastId, title, courseName, thumbnailUrl }: MiniPlayerProps) => {
  const { 
    audioElement,
    isPlaying, 
    currentTime, 
    duration,
    setCurrentTime,
    play, 
    pause
  } = useAudioStore();

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipForward = () => {
    if (audioElement) {
      const newTime = Math.min(currentTime + 10, duration);
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (audioElement) {
      const newTime = Math.max(currentTime - 10, 0);
      setCurrentTime(newTime);
    }
  };
  
  // Add vibration feedback to button interactions
  const handleInteraction = () => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  // Calculate progress safely
  const calculateProgress = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg z-20 p-3">
      <div className="flex items-center gap-3">
        {/* Thumbnail or default icon */}
        <div className="w-10 h-10 rounded-md bg-primary/10 flex-shrink-0 overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
              🎧
            </div>
          )}
        </div>
        
        {/* Title and progress */}
        <div className="flex-1 min-w-0" onClick={handleInteraction}>
          <Link to={`/podcast/${podcastId}`}>
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-gray-500 truncate">{courseName}</p>
          </Link>
          
          {/* Simple progress bar */}
          <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center">
          <PlayerControls 
            isPlaying={isPlaying}
            onPlayPause={togglePlay}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
            size="small"
          />
        </div>
        
        {/* Full-screen button */}
        <Link to={`/podcast/${podcastId}`} onClick={handleInteraction}>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ChevronUp className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MiniPlayer;
