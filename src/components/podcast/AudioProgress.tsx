
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
  const lastSeekTimeRef = useRef(0);
  
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
    if (progressDiff > 1.0) { // Increased threshold to reduce updates
      progressRef.current = progress;
    }
  }, [progress]);
  
  // Use useCallback with stronger debouncing for seeking
  const handleSliderChange = useCallback((value: number[]) => {
    if (onSeek && value && value.length > 0) {
      // Ignore rapid changes (debounce)
      const now = Date.now();
      if (now - lastSeekTimeRef.current < 200) {
        return;
      }
      lastSeekTimeRef.current = now;
      
      // Cancel any pending updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Schedule the update with a delay to avoid rapid successive updates
      updateTimeoutRef.current = setTimeout(() => {
        onSeek(value[0]);
        updateTimeoutRef.current = null;
      }, 100); // Increased timeout for more aggressive debouncing
    }
  }, [onSeek]);
  
  return (
    <div className="space-y-2">
      <Slider 
        value={[progressRef.current]} 
        min={0}
        max={100}
        step={0.5} // Reduced precision to minimize updates
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

// Use React.memo with a custom comparison function to prevent unnecessary re-renders
export default React.memo(AudioProgress, (prevProps, nextProps) => {
  // Only re-render if time changes by more than 1 second or duration changes significantly
  return (
    Math.abs(prevProps.currentTime - nextProps.currentTime) < 1 &&
    Math.abs(prevProps.duration - nextProps.duration) < 1
  );
});
