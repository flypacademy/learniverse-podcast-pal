
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import { ChevronUp, X, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MiniPlayerProps {
  podcastId: string;
  title: string;
  courseName: string;
  thumbnailUrl?: string;
}

const MiniPlayer = ({ podcastId, title, courseName, thumbnailUrl }: MiniPlayerProps) => {
  const navigate = useNavigate();
  const { isPlaying, currentTime, duration, play, pause } = useAudioStore();
  
  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Handle expand click to navigate to full player
  const handleExpandClick = () => {
    console.log("MiniPlayer: Navigating to full player for", podcastId);
    navigate(`/podcast/${podcastId}`);
  };
  
  // Handle close click to stop playback and reset
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("MiniPlayer: Close clicked");
    pause();
  };
  
  // Toggle play/pause
  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  return (
    <Card 
      className="rounded-2xl shadow-lg bg-white border-none overflow-hidden relative"
      onClick={handleExpandClick}
    >
      {/* Progress bar at the top */}
      <div className="h-1.5 bg-gray-200 w-full absolute top-0 left-0">
        <div 
          className="h-full bg-primary transition-all duration-200 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="p-3 flex items-center gap-3">
        {/* Thumbnail */}
        <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm text-white">🎧</span>
            </div>
          )}
        </div>
        
        {/* Title and course info */}
        <div className="flex-1 min-w-0 mr-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
          <p className="text-xs text-gray-500 truncate">{courseName}</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-primary text-white flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          
          <button 
            type="button"
            onClick={handleCloseClick}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:text-gray-700"
            aria-label="Expand player"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default MiniPlayer;
