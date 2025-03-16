
import React from "react";
import { formatTime } from "@/lib/utils";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };
  
  return (
    <div className="space-y-2">
      <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary rounded-full" 
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
