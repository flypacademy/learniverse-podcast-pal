
import React from "react";
import { Slider } from "@/components/ui/slider";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (percent: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  // Ensure currentTime and duration are valid numbers
  const safeCurrentTime = isNaN(currentTime) || currentTime < 0 ? 0 : currentTime;
  const safeDuration = isNaN(duration) || duration <= 0 ? 1 : duration;
  
  // Ensure progress is always a valid number between 0-100
  const progress = Math.min(100, Math.max(0, (safeCurrentTime / safeDuration) * 100));
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSliderChange = (value: number[]) => {
    if (onSeek && value && value.length > 0 && !isNaN(value[0])) {
      onSeek(value[0]);
    }
  };
  
  return (
    <div className="space-y-1.5">
      <Slider 
        value={[progress]} 
        min={0}
        max={100}
        step={0.1}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatTime(safeCurrentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
