
import React from "react";
import ProgressBar from "@/components/ProgressBar";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
}

const AudioProgress = ({ currentTime, duration }: AudioProgressProps) => {
  const progress = (currentTime / (duration || 1)) * 100;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-1.5">
      <ProgressBar 
        value={progress} 
        size="lg" 
        color="bg-primary"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
