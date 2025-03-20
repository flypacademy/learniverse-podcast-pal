
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
    <div className={`flex items-center justify-center ${isSmall ? 'gap-2' : 'gap-8'}`}>
      <button 
        className="text-gray-500 hover:text-gray-700 transition-colors"
        onClick={onSkipBack}
        aria-label="Skip back 10 seconds"
        type="button"
      >
        <SkipBack className={`${isSmall ? 'h-5 w-5' : 'h-7 w-7'}`} />
      </button>
      
      <button 
        onClick={onPlayPause}
        className={`${
          isSmall 
            ? 'h-10 w-10' 
            : 'h-16 w-16'
        } rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105`}
        aria-label={isPlaying ? "Pause" : "Play"}
        type="button"
      >
        {isPlaying ? 
          <Pause className={`${isSmall ? 'h-5 w-5' : 'h-7 w-7'}`} /> : 
          <Play className={`${isSmall ? 'h-5 w-5 ml-0.5' : 'h-7 w-7 ml-1'}`} />
        }
      </button>
      
      <button 
        className="text-gray-500 hover:text-gray-700 transition-colors"
        onClick={onSkipForward}
        aria-label="Skip forward 10 seconds"
        type="button"
      >
        <SkipForward className={`${isSmall ? 'h-5 w-5' : 'h-7 w-7'}`} />
      </button>
    </div>
  );
};

export default PlayerControls;
