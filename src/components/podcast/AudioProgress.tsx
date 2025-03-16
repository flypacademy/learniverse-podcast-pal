
import React from "react";
import { Slider } from "@/components/ui/slider";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (seconds: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  // Calculate progress safely
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (value: number[]) => {
    if (!onSeek || duration <= 0) return;
    
    // Convert percentage to seconds
    const seekTimeInSeconds = (value[0] / 100) * duration;
    onSeek(seekTimeInSeconds);
  };
  
  return (
    <div className="space-y-2">
      <Slider
        value={[progress]}
        min={0}
        max={100}
        step={0.1}
        onValueChange={handleSeek}
        className="w-full"
        variant="progress"
      />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
