
import React from "react";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  labelPosition?: "inside" | "right";
}

const ProgressBar = ({
  value,
  color = "bg-primary",
  size = "md",
  showLabel = false,
  labelPosition = "right"
}: ProgressBarProps) => {
  const height = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3"
  }[size];
  
  const labelSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];

  const safeValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className="flex items-center gap-2">
      <div className={`progress-bar ${height} flex-1`}>
        <div 
          className={`progress-value ${color}`}
          style={{ width: `${safeValue}%` }}
        >
          {showLabel && labelPosition === "inside" && safeValue > 15 && (
            <span className="absolute right-1 text-xs text-white">{Math.round(safeValue)}%</span>
          )}
        </div>
      </div>
      
      {showLabel && labelPosition === "right" && (
        <span className={`${labelSize} font-medium`}>{Math.round(safeValue)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
