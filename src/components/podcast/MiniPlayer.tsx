
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import { formatTime } from "@/lib/utils";
import PlayerControls from "./PlayerControls";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MiniPlayerProps {
  podcastId: string;
  title: string;
  courseName: string;
  thumbnailUrl?: string;
}

const MiniPlayer = ({ podcastId, title, courseName, thumbnailUrl }: MiniPlayerProps) => {
  // We'll use local state and sync it with the store to avoid recursive updates
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  
  const { 
    audioElement,
    isPlaying, 
    currentTime, 
    duration,
    setCurrentTime,
    play, 
    pause
  } = useAudioStore();

  // Sync local state with store - only when the store values change
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
    setLocalCurrentTime(currentTime);
    setLocalDuration(duration);
  }, [isPlaying, currentTime, duration]);

  const togglePlay = () => {
    if (localIsPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipForward = () => {
    if (audioElement) {
      const newTime = Math.min(localCurrentTime + 10, localDuration);
      setCurrentTime(newTime);
    }
  };

  const skipBackward = () => {
    if (audioElement) {
      const newTime = Math.max(localCurrentTime - 10, 0);
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
    if (!localDuration || localDuration === 0) return 0;
    return (localCurrentTime / localDuration) * 100;
  };

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    if (audioElement && localDuration > 0) {
      const newTime = (value[0] / 100) * localDuration;
      setCurrentTime(newTime);
    }
  };

  // If there's no podcast playing, don't render the miniplayer
  if (!podcastId) return null;

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
          
          {/* Time display */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(localCurrentTime)}</span>
            <span>{formatTime(localDuration)}</span>
          </div>
          
          {/* Slider for progress */}
          <div className="mt-1">
            <Slider
              value={[calculateProgress()]}
              max={100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="mt-0"
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center">
          <PlayerControls 
            isPlaying={localIsPlaying}
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
