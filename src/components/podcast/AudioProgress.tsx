
import React, { useCallback, useRef, useEffect } from "react";
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
  
  // Use refs to track the previous progress value to prevent unnecessary updates
  const progressRef = useRef(progress);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  
  // Only update the slider when there's a significant change in progress
  useEffect(() => {
    const progressDiff = Math.abs(progress - progressRef.current);
    if (progressDiff > 0.5) { // Only update if progress changed by more than 0.5%
      progressRef.current = progress;
    }
  }, [progress]);
  
  // Use useCallback to prevent unnecessary re-renders and potential loops
  const handleSliderChange = useCallback((value: number[]) => {
    if (onSeek && value && value.length > 0) {
      // Cancel any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Schedule the update with a small delay to avoid rapid successive updates
      updateTimeoutRef.current = setTimeout(() => {
        onSeek(value[0]);
        updateTimeoutRef.current = null;
      }, 50);
    }
  }, [onSeek]);
  
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

// Use React.memo to prevent unnecessary re-renders
export default React.memo(AudioProgress);
