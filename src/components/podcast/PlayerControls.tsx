
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  size?: "small" | "medium" | "large";
}

const PlayerControls = ({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  size = "medium"
}: PlayerControlsProps) => {
  // Size-based styles
  const getButtonStyles = () => {
    switch(size) {
      case "small":
        return {
          skipButton: "h-8 w-8",
          playButton: "h-10 w-10",
          iconSize: "h-4 w-4",
          playIconSize: "h-5 w-5"
        };
      case "large":
        return {
          skipButton: "h-12 w-12",
          playButton: "h-16 w-16",
          iconSize: "h-6 w-6",
          playIconSize: "h-8 w-8"
        };
      default: // medium
        return {
          skipButton: "h-10 w-10",
          playButton: "h-14 w-14",
          iconSize: "h-5 w-5",
          playIconSize: "h-7 w-7"
        };
    }
  };
  
  const styles = getButtonStyles();
  
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onSkipBack}
        className={styles.skipButton}
        aria-label="Skip backward"
      >
        <SkipBack className={styles.iconSize} />
      </Button>
      
      <Button
        type="button"
        size="icon"
        variant={size === "small" ? "ghost" : "default"}
        onClick={onPlayPause}
        className={`${styles.playButton} ${size !== "small" ? "bg-primary hover:bg-primary/90" : ""} rounded-full`}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className={styles.playIconSize} />
        ) : (
          <Play className={styles.playIconSize} style={{ marginLeft: "2px" }} />
        )}
      </Button>
      
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onSkipForward}
        className={styles.skipButton}
        aria-label="Skip forward"
      >
        <SkipForward className={styles.iconSize} />
      </Button>
    </div>
  );
};

export default PlayerControls;
