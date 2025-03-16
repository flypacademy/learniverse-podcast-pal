
import React from "react";
import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  onChange: (value: number) => void;
}

const VolumeControl = ({ volume, onChange }: VolumeControlProps) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onChange(newVolume);
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.3) return <Volume className="h-5 w-5" />;
    if (volume < 0.7) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };
  
  return (
    <div className="flex items-center space-x-2">
      <button 
        className="text-gray-300 hover:text-white"
        onClick={() => onChange(0)}
        aria-label="Mute"
      >
        {getVolumeIcon()}
      </button>
      
      <div className="relative flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary rounded-full" 
          style={{ width: `${volume * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default VolumeControl;
