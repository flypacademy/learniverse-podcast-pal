
import React, { useEffect, useState } from "react";
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
    isPlaying, 
    currentTime, 
    duration,
    audioElement,
    play, 
    pause,
    setCurrentTime
  } = useAudioStore();
  
  // Use local state to prevent rendering issues during transitions
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(100);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  
  // Sync with audio store values once they're stable
  useEffect(() => {
    if (isFinite(currentTime) && currentTime >= 0) {
      setLocalCurrentTime(currentTime);
    }
  }, [currentTime]);
  
  useEffect(() => {
    if (isFinite(duration) && duration > 0) {
      setLocalDuration(duration);
    }
  }, [duration]);
  
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);
  
  // Ensure audio continues playing when mini player appears
  useEffect(() => {
    // If audio is supposed to be playing but actually isn't, restart it
    if (localIsPlaying && audioElement && audioElement.paused) {
      // Small timeout to allow for DOM updates
      const timer = setTimeout(() => {
        play();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [localIsPlaying, audioElement, play]);

  const togglePlay = () => {
    if (localIsPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipForward = () => {
    const newTime = Math.min(localCurrentTime + 10, localDuration);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(localCurrentTime - 10, 0);
    setCurrentTime(newTime);
  };

  // Calculate progress safely
  const progress = localDuration > 0 ? (localCurrentTime / localDuration * 100) : 0;

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg z-20 p-3 animate-fade-in">
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
        <div className="flex-1 min-w-0">
          <Link to={`/podcast/${podcastId}`}>
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-gray-500 truncate">{courseName}</p>
          </Link>
          
          {/* Simple progress bar */}
          <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            ></div>
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
        <Link to={`/podcast/${podcastId}`}>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ChevronUp className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MiniPlayer;
