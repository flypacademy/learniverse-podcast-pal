
import React, { useEffect, useState } from "react";
import { useAudioStore } from "@/lib/audioContext";
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

  // Use the tracking hook to save progress
  useMiniPlayerTracking(podcastId);
  
  // Use local state to prevent rendering issues during transitions
  const [localProgress, setLocalProgress] = useState(0);
  
  // Update progress calculation whenever time or duration changes
  useEffect(() => {
    if (isFinite(currentTime) && isFinite(duration) && duration > 0) {
      const calculatedProgress = (currentTime / duration) * 100;
      setLocalProgress(Math.min(100, Math.max(0, calculatedProgress)));
    }
  }, [currentTime, duration]);
  
  // Critical: Ensure audio continues playing when mini player appears
  useEffect(() => {
    console.log("MiniPlayer mounted for podcast:", podcastId);
    
    if (isPlaying && audioElement && audioElement.paused) {
      console.log("MiniPlayer: Audio should be playing but isn't, resuming playback");
      
      // Try to play with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (isPlaying && audioElement && audioElement.paused) {
          console.log("MiniPlayer: Attempting to resume playback");
          const playPromise = audioElement.play();
          
          if (playPromise) {
            playPromise.catch(error => {
              console.warn("MiniPlayer: Could not resume playback:", error);
              
              // Try again with a longer delay
              setTimeout(() => {
                if (isPlaying && audioElement && audioElement.paused) {
                  audioElement.play().catch(e => {
                    console.warn("MiniPlayer: Second attempt failed:", e);
                  });
                }
              }, 500);
            });
          }
        }
      }, 200);
    }
  }, [isPlaying, audioElement, play, podcastId]);

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
