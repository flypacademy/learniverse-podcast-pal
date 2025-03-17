
import React from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
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

  const getVolumeIcon = () => {
    if (safeVolume === 0) return <VolumeX className="h-4 w-4" />;
    if (safeVolume < 30) return <Volume className="h-4 w-4" />;
    if (safeVolume < 70) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-3 max-w-xs mx-auto">
      <div className="text-gray-500">
        {getVolumeIcon()}
      </div>
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
