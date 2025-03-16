
import React from "react";
import { Slider } from "@/components/ui/slider";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (percent: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSliderChange = (values: number[]) => {
    if (onSeek && duration > 0) {
      const seekTime = (values[0] / 100) * duration;
      onSeek(seekTime);
    }
  };
  
  return (
    <div className="space-y-1.5">
      <Slider
        value={[progress]}
        max={100}
        step={0.1}
        onValueChange={handleSliderChange}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
