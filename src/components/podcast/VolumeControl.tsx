
import React from "react";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  // Ensure volume is between 0 and 1
  const safeVolume = Math.max(0, Math.min(1, volume));
  
  // Convert volume to percentage for display
  const volumePercentage = Math.round(safeVolume * 100);
  
  const handleVolumeChange = (value: number[]) => {
    // Convert the slider value (0-100) back to a value between 0 and 1
    const newVolume = value[0] / 100;
    onVolumeChange(newVolume);
  };
  
  return (
    <div className="flex items-center gap-3 max-w-xs">
      <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <Slider
        value={[volumePercentage]}
        min={0}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        className="w-full"
      />
    </div>
  );
};

export default VolumeControl;
