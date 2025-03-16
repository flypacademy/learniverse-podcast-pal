
import React from "react";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  return (
    <div className="flex items-center gap-3 max-w-xs mx-auto">
      <Volume2 className="h-4 w-4 text-gray-500" />
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onVolumeChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
};

export default VolumeControl;
