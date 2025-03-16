
import React from "react";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeControl = ({ volume, onVolumeChange }: VolumeControlProps) => {
  const handleVolumeChange = (values: number[]) => {
    onVolumeChange(values[0]);
  };

  return (
    <div className="flex items-center gap-3 max-w-xs mx-auto">
      <Volume2 className="h-4 w-4 text-gray-500" />
      <Slider
        value={[volume]}
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
