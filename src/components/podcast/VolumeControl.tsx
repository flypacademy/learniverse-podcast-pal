
import React from "react";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  // Convert volume to percentage for display
  const volumePercentage = Math.round(volume * 100);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse the input value as number, divide by 100 to get a value between 0 and 1
    const newVolume = parseInt(e.target.value, 10) / 100;
    onVolumeChange(newVolume);
  };
  
  return (
    <div className="flex items-center gap-3 max-w-xs mx-auto">
      <Volume2 className="h-4 w-4 text-gray-500" />
      <input
        type="range"
        min="0"
        max="100"
        value={volumePercentage}
        onChange={handleVolumeChange}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
};

export default VolumeControl;
