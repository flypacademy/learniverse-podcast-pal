
import React, { useEffect, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";
import { formatTime } from "@/lib/utils";
import MiniPlayerThumbnail from "./MiniPlayerThumbnail";
import MiniPlayerInfo from "./MiniPlayerInfo";
import MiniPlayerControls from "./MiniPlayerControls";
import { useMiniPlayerTracking } from "@/hooks/podcast/useMiniPlayerTracking";

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
  
  // Use local state to prevent rendering issues during transitions
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(100);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  
  // Initialize progress tracking for XP
  const { saveProgress } = useMiniPlayerTracking({
    podcastId,
    isPlaying,
    audioElement
  });
  
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
        <MiniPlayerThumbnail 
          thumbnailUrl={thumbnailUrl} 
          title={title} 
        />
        
        <MiniPlayerInfo 
          podcastId={podcastId}
          title={title}
          courseName={courseName}
          progress={progress}
        />
        
        <MiniPlayerControls 
          podcastId={podcastId}
          isPlaying={localIsPlaying}
          onPlayPause={togglePlay}
          onSkipBack={skipBackward}
          onSkipForward={skipForward}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
