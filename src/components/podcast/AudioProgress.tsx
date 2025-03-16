
import React from "react";
import ProgressBar from "@/components/ProgressBar";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (percent: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  // Calculate progress safely
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percent = (clickPosition / rect.width) * 100;
    
    // Convert percent to seconds
    const seekTime = (percent / 100) * duration;
    onSeek(seekTime);
  };
  
  return (
    <div className="space-y-1.5">
      <div 
        className="relative cursor-pointer" 
        onClick={handleSeek}
      >
        <ProgressBar 
          value={progress} 
          size="lg" 
          color="bg-primary"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
