
import React from "react";

interface MiniPlayerProgressProps {
  progress: number;
}

const MiniPlayerProgress = ({ progress }: MiniPlayerProgressProps) => {
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
};

export default MiniPlayerProgress;
