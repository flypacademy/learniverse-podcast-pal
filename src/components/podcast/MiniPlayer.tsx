
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import PlayerControls from "./PlayerControls";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MiniPlayerProps {
  podcastId: string;
  title: string;
  courseName: string;
  thumbnailUrl?: string;
}

const MiniPlayer = ({ podcastId, title, courseName, thumbnailUrl }: MiniPlayerProps) => {
  // Use local state to avoid unnecessary re-renders
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [recoveringAudio, setRecoveringAudio] = useState(false);
  
  const { 
    isPlaying, 
    currentTime, 
    duration,
    play, 
    pause,
    audioElement,
    continuePlayback,
    podcastMeta
  } = useAudioStore();

  // Check if audio element exists, if not try to recreate it
  useEffect(() => {
    if (!audioElement && podcastMeta?.audioUrl && !recoveringAudio) {
      console.log("MiniPlayer: No audio element, attempting to continue playback");
      setRecoveringAudio(true);
      
      // Use a timeout to avoid React state update loops
      setTimeout(() => {
        try {
          continuePlayback();
        } catch (err) {
          console.error("Error continuing playback:", err);
        } finally {
          setRecoveringAudio(false);
        }
      }, 100);
    }
  }, [audioElement, podcastMeta?.audioUrl, continuePlayback, recoveringAudio]);

  // Sync local state with store - only when the store values change
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
    setLocalCurrentTime(currentTime);
    setLocalDuration(duration || 0);
  }, [isPlaying, currentTime, duration]);

  const togglePlay = () => {
    if (recoveringAudio) {
      console.log("MiniPlayer: Audio recovery in progress, ignoring play request");
      return;
    }
    
    if (localIsPlaying) {
      console.log("MiniPlayer: Pausing audio");
      pause();
    } else {
      console.log("MiniPlayer: Attempting to play audio");
      
      // Check if we have a valid audio URL
      if (!podcastMeta?.audioUrl) {
        toast({
          title: "Playback error",
          description: "Audio source not available",
          variant: "destructive"
        });
        return;
      }
      
      // If no audio element, try to recreate it before playing
      if (!audioElement) {
        console.log("MiniPlayer: No audio element, recreating");
        setRecoveringAudio(true);
        
        try {
          continuePlayback();
          
          // Use a timeout to ensure the audio is created before playing
          setTimeout(() => {
            try {
              const newAudioElement = useAudioStore.getState().audioElement;
              if (newAudioElement) {
                play();
              }
            } catch (err) {
              console.error("Error during delayed play:", err);
              toast({
                title: "Playback error",
                description: "Could not start playback",
                variant: "destructive"
              });
            } finally {
              setRecoveringAudio(false);
            }
          }, 800); // Longer delay to ensure audio is ready
        } catch (err) {
          console.error("Error during audio continuation:", err);
          setRecoveringAudio(false);
        }
      } else {
        // We have an audio element, try to play it directly
        try {
          play();
        } catch (err) {
          console.error("Error during play:", err);
          
          // Try recreating the audio element as a fallback
          if (!recoveringAudio) {
            setRecoveringAudio(true);
            
            try {
              continuePlayback();
              
              setTimeout(() => {
                try {
                  play();
                } catch (playErr) {
                  console.error("Error during retry play:", playErr);
                } finally {
                  setRecoveringAudio(false);
                }
              }, 800);
            } catch (continueErr) {
              console.error("Error during audio continuation:", continueErr);
              setRecoveringAudio(false);
            }
          }
        }
      }
    }
  };

  const skipForward = () => {
    if (recoveringAudio) return;
    
    const newTime = Math.min(localCurrentTime + 10, localDuration);
    useAudioStore.getState().setCurrentTime(newTime);
  };

  const skipBackward = () => {
    if (recoveringAudio) return;
    
    const newTime = Math.max(localCurrentTime - 10, 0);
    useAudioStore.getState().setCurrentTime(newTime);
  };
  
  // Add vibration feedback to button interactions
  const handleInteraction = () => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };

  // Calculate progress safely
  const calculateProgress = () => {
    if (!localDuration || localDuration === 0) return 0;
    return (localCurrentTime / localDuration) * 100;
  };

  // If there's no podcast playing, don't render the miniplayer
  if (!podcastId) return null;

  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg z-20 p-3">
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
        <div className="flex-1 min-w-0" onClick={handleInteraction}>
          <Link to={`/podcast/${podcastId}`}>
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-gray-500 truncate">{courseName}</p>
          </Link>
          
          {/* Simple progress bar */}
          <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${calculateProgress()}%` }}
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
        <Link to={`/podcast/${podcastId}`} onClick={handleInteraction}>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <ChevronUp className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MiniPlayer;
