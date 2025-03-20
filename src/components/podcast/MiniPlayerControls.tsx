
import React from "react";
import PlayerControls from "./PlayerControls";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

interface MiniPlayerControlsProps {
  podcastId: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

const MiniPlayerControls = ({
  podcastId,
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward
}: MiniPlayerControlsProps) => {
  return (
    <div className="flex items-center">
      <PlayerControls 
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onSkipBack={onSkipBack}
        onSkipForward={onSkipForward}
        size="small"
      />
      
      {/* Full-screen button */}
      <Link to={`/podcast/${podcastId}`}>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
          <ChevronUp className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};

export default MiniPlayerControls;
