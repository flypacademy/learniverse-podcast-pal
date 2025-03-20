
import React from "react";

interface MiniPlayerProgressProps {
  progress: number;
}

const MiniPlayerProgress = ({ progress }: MiniPlayerProgressProps) => {
  // Ensure progress is within valid range
  const safeProgress = Math.max(0, Math.min(progress, 100));
  
  return (
    <div className="mt-1 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full"
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default MiniPlayerProgress;
