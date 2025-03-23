
import { useEffect } from "react";

// Completion threshold (when to mark podcast as completed)
const COMPLETION_THRESHOLD = 0.95;

export function useCompletionDetection(
  podcastId: string | undefined,
  duration: number,
  currentTime: number,
  saveProgress: (completed?: boolean) => Promise<void>
) {
  // Check if podcast should be marked as completed based on progress
  useEffect(() => {
    if (podcastId && duration > 0) {
      // If near the end or at the end, mark as completed
      if (currentTime >= duration * COMPLETION_THRESHOLD) {
        console.log(`Podcast ${podcastId} has reached completion threshold (${Math.round(COMPLETION_THRESHOLD*100)}%)`);
        saveProgress(true);
      }
    }
  }, [currentTime, duration, podcastId, saveProgress]);
  
  // Check if position indicates completion
  const isPositionCompleted = (position: number): boolean => {
    return duration > 0 && position >= duration * COMPLETION_THRESHOLD;
  };
  
  return {
    isPositionCompleted,
    COMPLETION_THRESHOLD
  };
}
