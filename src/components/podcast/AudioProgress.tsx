
import React from "react";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/pages/admin/podcasts/utils/formatters";

interface AudioProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (percent: number) => void;
}

const AudioProgress = ({ currentTime, duration, onSeek }: AudioProgressProps) => {
  // Ensure currentTime and duration are valid numbers
  const safeCurrentTime = isNaN(currentTime) || currentTime < 0 ? 0 : currentTime;
  const safeDuration = isNaN(duration) || duration <= 0 ? 100 : duration;
  
  // Calculate progress as a percentage (0-100)
  const progress = Math.min(100, Math.max(0, (safeCurrentTime / safeDuration) * 100));
  
  const handleSliderChange = (value: number[]) => {
    if (onSeek && value && value.length > 0) {
      onSeek(value[0]);
    }
  };
  
  return (
    <div className="space-y-2">
      <Slider 
        value={[progress]} 
        min={0}
        max={100}
        step={0.1}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 font-medium">
        <span>{formatDuration(safeCurrentTime)}</span>
        <span>{formatDuration(safeDuration)}</span>
      </div>
    </div>
  );
};

export default AudioProgress;
