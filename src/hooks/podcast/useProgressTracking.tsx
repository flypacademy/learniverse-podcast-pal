
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useIconToast } from '@/components/ui/custom-toast';
import { useXP } from '@/hooks/useXP';
import { calculateListeningXP, XP_AMOUNTS, XPReason } from '@/utils/xpUtils';

interface UseProgressTrackingProps {
  podcastId: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  markCompleted?: (completed: boolean) => void;
}

export const useProgressTracking = ({
  podcastId,
  duration,
  currentTime,
  isPlaying,
  markCompleted
}: UseProgressTrackingProps) => {
  const [totalListened, setTotalListened] = useState(0);
  const [hasEarnedCompletionXP, setHasEarnedCompletionXP] = useState(false);
  const lastTimeRef = useRef(0);
  const playTimeRef = useRef(0);
  const listenedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { awardXP } = useXP();
  const { toast: iconToast } = useIconToast();

  // Calculate completion percentage
  const completionPercentage = duration > 0 
    ? Math.min(100, Math.floor((currentTime / duration) * 100))
    : 0;

  // Track total time listened
  useEffect(() => {
    if (isPlaying) {
      // Start timer when playing begins
      if (listenedIntervalRef.current) {
        clearInterval(listenedIntervalRef.current);
      }
      
      listenedIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - playTimeRef.current;
        playTimeRef.current = now;
        
        // Only count time if we're really progressing (avoid counting when paused or buffering)
        if (elapsed > 0 && elapsed < 1100) { // 1.1 seconds to account for slight timing variations
          setTotalListened(prev => prev + elapsed / 1000);
        }
      }, 1000);
      
      // Initialize the playtime ref
      playTimeRef.current = Date.now();
    } else {
      // Clear interval when paused
      if (listenedIntervalRef.current) {
        clearInterval(listenedIntervalRef.current);
        listenedIntervalRef.current = null;
      }
    }
    
    return () => {
      if (listenedIntervalRef.current) {
        clearInterval(listenedIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Save progress more frequently (every 3 seconds during active listening)
  useEffect(() => {
    const saveInterval = 5000; // 5 seconds
    
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }
    
    saveProgressIntervalRef.current = setInterval(() => {
      // Only save if current time has changed since last save
      if (currentTime !== lastTimeRef.current && currentTime > 0) {
        saveProgress();
        lastTimeRef.current = currentTime;
      }
    }, saveInterval);
    
    return () => {
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }
    };
  }, [currentTime]);

  // Award XP for listening time
  useEffect(() => {
    // Award XP in ~5-minute increments for listening time
    const xpThreshold = 300; // seconds (5 minutes)
    if (totalListened > 0 && totalListened % xpThreshold < 10 && totalListened > 10) {
      const xpAmount = calculateListeningXP(xpThreshold);
      awardXP(xpAmount, XPReason.LISTENING_TIME);
      
      // Show a toast notification
      iconToast({
        title: `+${xpAmount} XP`,
        description: `Earned for listening time`,
        icon: "zap"
      });
    }
  }, [totalListened, awardXP]);

  // Check for podcast completion and award XP
  useEffect(() => {
    // Consider podcast completed at 90%
    const completionThreshold = 90;
    
    if (completionPercentage >= completionThreshold && !hasEarnedCompletionXP) {
      setHasEarnedCompletionXP(true);
      
      // Mark as completed in the parent component if callback provided
      if (markCompleted) {
        markCompleted(true);
      }
      
      // Award completion XP
      awardXP(XP_AMOUNTS.PODCAST_COMPLETION, XPReason.PODCAST_COMPLETION);
      
      // Show a toast notification
      iconToast({
        title: `+${XP_AMOUNTS.PODCAST_COMPLETION} XP`,
        description: 'Earned for completing this podcast',
        icon: "trophy"
      });
    }
  }, [completionPercentage, hasEarnedCompletionXP, markCompleted, awardXP]);

  // Save progress to database
  const saveProgress = useCallback(async () => {
    if (!podcastId || currentTime <= 0) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.error('No authenticated user found');
        return;
      }
      
      const userId = session.user.id;
      
      // First check if a progress record exists
      const { data: existingProgress } = await supabase
        .from('podcast_progress')
        .select('id, progress_seconds, completed')
        .eq('user_id', userId)
        .eq('podcast_id', podcastId)
        .maybeSingle();
      
      // Ensure we only save progress moves forward (not backwards)
      if (existingProgress) {
        if (currentTime > existingProgress.progress_seconds) {
          const { error } = await supabase
            .from('podcast_progress')
            .update({
              progress_seconds: currentTime,
              completed: completionPercentage >= 90,
              updated_at: new Date().toISOString(), // Always update timestamp
            })
            .eq('id', existingProgress.id);
          
          if (error) {
            console.error('Error updating podcast progress:', error);
          }
        }
      } else {
        // Create a new progress record
        const { error } = await supabase
          .from('podcast_progress')
          .insert({
            user_id: userId,
            podcast_id: podcastId,
            progress_seconds: currentTime,
            completed: completionPercentage >= 90,
          });
        
        if (error) {
          console.error('Error creating podcast progress:', error);
        }
      }
    } catch (error) {
      console.error('Error saving podcast progress:', error);
    }
  }, [podcastId, currentTime, completionPercentage]);

  // Save progress when unmounting
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  return {
    completionPercentage,
    totalListened,
    saveProgress
  };
};
