
import React, { useEffect, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { formatTime } from "@/lib/utils";
import MiniPlayerThumbnail from "./MiniPlayerThumbnail";
import MiniPlayerInfo from "./MiniPlayerInfo";
import MiniPlayerControls from "./MiniPlayerControls";
import { useXP } from "@/hooks/useXP";
import { XPReason } from "@/types/xp";
import { supabase } from "@/lib/supabase";

interface MiniPlayerProps {
  podcastId: string;
  title: string;
  courseName: string;
  thumbnailUrl?: string;
}

const MiniPlayer = ({ podcastId, title, courseName, thumbnailUrl }: MiniPlayerProps) => {
  const { 
    isPlaying, 
    currentTime, 
    duration,
    audioElement,
    play, 
    pause,
    setCurrentTime
  } = useAudioStore();
  
  const { awardXP } = useXP();
  
  // Use local state to prevent rendering issues during transitions
  const [localProgress, setLocalProgress] = useState(0);
  
  // Update progress calculation
  useEffect(() => {
    if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
      setLocalProgress(Math.min(100, Math.max(0, (currentTime / duration) * 100)));
    }
  }, [currentTime, duration]);
  
  // Critical: Ensure audio continues playing when mini player appears
  useEffect(() => {
    const ensurePlayback = () => {
      if (isPlaying && audioElement && audioElement.paused) {
        console.log("MiniPlayer: Audio should be playing but isn't, restarting");
        play();
      }
    };
    
    // Check immediately
    ensurePlayback();
    
    // And again after a short delay
    const timer = setTimeout(ensurePlayback, 100);
    
    return () => clearTimeout(timer);
  }, [isPlaying, audioElement, play]);
  
  // Track progress for saving and XP
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
          saveProgress();
          lastSaveTime = now;
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(trackingInterval);
      
      // Final save on unmount
      saveProgress();
      
      // Award XP for remaining time
      if (listeningSeconds >= 10) {
        const minutes = Math.floor(listeningSeconds / 60);
        if (minutes > 0) {
          awardXP(minutes * 10, XPReason.LISTENING_TIME);
        }
      }
    };
  }, [podcastId, isPlaying, audioElement, awardXP]);
  
  // Save progress to database
  const saveProgress = async () => {
    if (!audioElement || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const userId = session.user.id;
      const last_position = Math.floor(currentTime);
      
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
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg z-20 p-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <MiniPlayerThumbnail 
          thumbnailUrl={thumbnailUrl} 
          title={title} 
        />
        
        <MiniPlayerInfo 
          podcastId={podcastId}
          title={title}
          courseName={courseName}
          progress={localProgress}
        />
        
        <MiniPlayerControls 
          podcastId={podcastId}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onSkipBack={skipBackward}
          onSkipForward={skipForward}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
