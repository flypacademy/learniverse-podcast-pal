
import React from "react";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  // Ensure volume is always a valid number between 0-100
  const safeVolume = isNaN(volume) || volume < 0 ? 0 : (volume > 100 ? 100 : volume);
  
  const handleVolumeChange = (value: number[]) => {
    if (value && value.length > 0 && !isNaN(value[0])) {
      onVolumeChange(value[0]);
    }
  };

  return (
    <div className="flex items-center gap-3 max-w-xs mx-auto">
      <Volume2 className="h-4 w-4 text-gray-500" />
      <Slider
        value={[safeVolume]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        className="w-full"
      />
    </div>
  );
};

export default VolumeControl;
