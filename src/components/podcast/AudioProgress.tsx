
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
  const isMounted = useRef(true);
  
  // Clear any pending timeouts on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Only update the slider when there's a significant change in progress
  useEffect(() => {
    const progressDiff = Math.abs(progress - progressRef.current);
    
    // Only update ref if there's a meaningful change (more than 2%)
    if (progressDiff > 2.0) {
      progressRef.current = progress;
    }
  }, [progress]);
  
  // Use useCallback with strong debouncing for seeking
  const handleSliderChange = useCallback((value: number[]) => {
    if (!onSeek || !value || value.length === 0) return;
    
    // Ignore rapid changes (debounce)
    const now = Date.now();
    if (now - lastSeekTimeRef.current < 300) {
      return;
    }
    
    lastSeekTimeRef.current = now;
    
    // Cancel any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule the update with a delay to avoid rapid successive updates
    updateTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        onSeek(value[0]);
        updateTimeoutRef.current = null;
      }
    }, 200);
  }, [onSeek]);
  
  return (
    <div className="space-y-2">
      <Slider 
        value={[progressRef.current]} 
        min={0}
        max={100}
        step={1.0} // Reduced precision further to minimize updates
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
// Only re-render if time changes by more than 2 seconds or duration changes significantly
export default React.memo(AudioProgress, (prevProps, nextProps) => {
  return (
    Math.abs(prevProps.currentTime - nextProps.currentTime) < 2 &&
    Math.abs(prevProps.duration - nextProps.duration) < 2
  );
});
