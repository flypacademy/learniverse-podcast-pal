
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import { formatTime } from "@/lib/utils";
import PlayerControls from "./PlayerControls";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useProgressTracking } from "@/hooks/podcast/useProgressTracking";
import { XPReason } from "@/types/xp";

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
    setCurrentTime,
    currentPodcastId
  } = useAudioStore();
  
  // Use local state to prevent rendering issues during transitions
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(100);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  
  // Initialize progress tracking for XP - ensure it works in the mini player
  const { saveProgress, awardListeningXP } = useProgressTracking(
    podcastId,
    { current: audioElement },
    isPlaying,
    undefined
  );
  
  // Track listening time for XP in mini player
  useEffect(() => {
    let trackingInterval: NodeJS.Timeout | null = null;
    let accumulatedTime = 0;
    let lastTimestamp = Date.now();
    
    if (isPlaying && audioElement && podcastId) {
      console.log("MiniPlayer: Starting XP tracking interval");
      
      // Track time and save progress while playing
      trackingInterval = setInterval(() => {
        if (audioElement) {
          // Calculate time elapsed since last check (in seconds)
          const now = Date.now();
          const elapsed = (now - lastTimestamp) / 1000;
          lastTimestamp = now;
          
          // Only count time if actually playing
          if (isPlaying && !audioElement.paused) {
            accumulatedTime += elapsed;
            
            // Award XP every full minute (60 seconds)
            if (accumulatedTime >= 60) {
              console.log(`MiniPlayer: Awarding XP for ${Math.floor(accumulatedTime)} seconds of listening`);
              awardListeningXP(accumulatedTime);
              accumulatedTime = 0;
            }
          }
          
          // Save current progress
          saveProgress();
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
        
        // Award XP for any accumulated listening time when unmounting
        if (audioElement && podcastId && accumulatedTime > 10) { // Only award if meaningful time spent
          console.log(`MiniPlayer: Unmounting - awarding XP for ${accumulatedTime} seconds`);
          awardListeningXP(accumulatedTime);
        }
      }
    };
  }, [isPlaying, audioElement, podcastId, saveProgress, awardListeningXP]);
  
  // Sync with audio store values once they're stable
  useEffect(() => {
    if (isFinite(currentTime) && currentTime >= 0) {
      setLocalCurrentTime(currentTime);
    }
  }, [currentTime]);
  
  useEffect(() => {
    if (isFinite(duration) && duration > 0) {
      setLocalDuration(duration);
    }
  }, [duration]);
  
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);
  
  // Critical: Ensure audio continues playing when mini player appears
  useEffect(() => {
    const checkAudioContinuity = () => {
      // If audio is supposed to be playing but actually isn't, restart it
      if (localIsPlaying && audioElement && audioElement.paused) {
        console.log("MiniPlayer: Detected audio should be playing but is paused, restarting playback");
        play();
      }
    };
    
    // Check immediately
    checkAudioContinuity();
    
    // And also check after a short delay to ensure the browser has processed events
    const timer = setTimeout(checkAudioContinuity, 100);
    
    return () => clearTimeout(timer);
  }, [localIsPlaying, audioElement, play]);

  const togglePlay = () => {
    if (localIsPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skipForward = () => {
    const newTime = Math.min(localCurrentTime + 10, localDuration);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(localCurrentTime - 10, 0);
    setCurrentTime(newTime);
  };

  // Calculate progress safely
  const progress = localDuration > 0 ? (localCurrentTime / localDuration * 100) : 0;

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg z-20 p-3 animate-fade-in">
      <div className="flex items-center gap-3">
        {/* Thumbnail or default icon */}
        <div className="w-10 h-10 rounded-md bg-primary/10 flex-shrink-0 overflow-hidden">
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
              🎧
            </div>
          )}
        </div>
        
        {/* Title and progress */}
        <div className="flex-1 min-w-0">
          <Link to={`/podcast/${podcastId}`}>
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-gray-500 truncate">{courseName}</p>
          </Link>
          
          {/* Simple progress bar */}
          <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            ></div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center">
          <PlayerControls 
            isPlaying={localIsPlaying}
            onPlayPause={togglePlay}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
            size="small"
          />
        </div>
        
        {/* Full-screen button */}
        <Link to={`/podcast/${podcastId}`}>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ChevronUp className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MiniPlayer;
