
import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  size?: "normal" | "small";
}

const PlayerControls = ({ 
  isPlaying, 
  onPlayPause, 
  onSkipBack = () => {}, 
  onSkipForward = () => {},
  size = "normal"
}: PlayerControlsProps) => {
  const isSmall = size === "small";
  
  return (
    <div className={`flex items-center justify-center ${isSmall ? 'gap-1' : 'gap-6'}`}>
      {!isSmall && (
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onSkipBack}
          aria-label="Skip back 10 seconds"
        >
          <SkipBack className="h-6 w-6" />
        </button>
      )}
      
      <button 
        onClick={onPlayPause}
        className={`${
          isSmall 
            ? 'h-8 w-8' 
            : 'h-14 w-14'
        } rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors`}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? 
          <Pause className={`${isSmall ? 'h-4 w-4' : 'h-6 w-6'}`} /> : 
          <Play className={`${isSmall ? 'h-4 w-4 ml-0.5' : 'h-6 w-6 ml-1'}`} />
        }
      </button>
      
      {!isSmall && (
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onSkipForward}
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default PlayerControls;
