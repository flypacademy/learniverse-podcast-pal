
import { useEffect } from 'react';
import { useAudioStore } from '@/lib/audioContext';
import { supabase } from '@/lib/supabase';
import { useXP } from '@/hooks/useXP';
import { XPReason } from '@/types/xp';

export function useMiniPlayerTracking(podcastId: string) {
  const { 
    isPlaying, 
    currentTime, 
    audioElement
  } = useAudioStore();
  
  const { awardXP } = useXP();
  
  // Track progress for saving
  useEffect(() => {
    if (!podcastId || !isPlaying || !audioElement) return;
    
    let lastSaveTime = Date.now();
    let lastTrackingTime = Date.now();
    let listeningSeconds = 0;
    
    const trackingInterval = setInterval(() => {
      // Only count if actually playing
      if (isPlaying && audioElement && !audioElement.paused) {
        const now = Date.now();
        
        // Calculate elapsed listening time
        const elapsed = (now - lastTrackingTime) / 1000;
        lastTrackingTime = now;
        listeningSeconds += elapsed;
        
        // Award XP every full minute (60 seconds)
        if (listeningSeconds >= 60) {
          const minutes = Math.floor(listeningSeconds / 60);
          awardXP(minutes * 10, XPReason.LISTENING_TIME);
          listeningSeconds = listeningSeconds % 60;
        }
        
        // Save progress every 5 seconds
        if (now - lastSaveTime > 5000) {
          saveProgress(podcastId, currentTime);
          lastSaveTime = now;
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(trackingInterval);
      
      // Final save on unmount
      saveProgress(podcastId, currentTime);
      
      // Award XP for remaining time
      if (listeningSeconds >= 10) {
        const minutes = Math.floor(listeningSeconds / 60);
        if (minutes > 0) {
          awardXP(minutes * 10, XPReason.LISTENING_TIME);
        }
      }
    };
  }, [podcastId, isPlaying, audioElement, currentTime, awardXP]);
  
  return { saveProgress };
}

// Save progress to database
async function saveProgress(podcastId: string, currentTime: number) {
  if (!podcastId) return;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    const userId = session.user.id;
    const last_position = Math.floor(currentTime);
    
    console.log("MiniPlayer: Saving progress:", {
      podcastId,
      position: last_position
    });
    
    // Check if record exists
    const { data: existingRecord } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('podcast_id', podcastId)
      .maybeSingle();
    
    const timestamp = new Date().toISOString();
    
    if (existingRecord) {
      // Update existing record
      await supabase
        .from('user_progress')
        .update({
          last_position,
          updated_at: timestamp
        })
        .eq('user_id', userId)
        .eq('podcast_id', podcastId);
    } else {
      // Insert new record
      await supabase
        .from('user_progress')
        .insert([
          {
            user_id: userId,
            podcast_id: podcastId,
            last_position,
            completed: false,
            updated_at: timestamp,
            created_at: timestamp
          }
        ]);
    }
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}
