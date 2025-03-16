
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CircularSliderProps {
  value: number; // 0 to 1
  onChange: (value: number) => void;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  knobColor?: string;
  knobSize?: number;
}

export const CircularSlider: React.FC<CircularSliderProps> = ({
  value = 0.5,
  onChange,
  size = 60,
  strokeWidth = 6,
  trackColor = "#E5E7EB",
  progressColor = "#3B82F6",
  knobColor = "#3B82F6",
  knobSize = 12,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate radius and center position
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate circumference and stroke-dasharray values
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - value);

  // Handle value change based on interaction position
  const calculateValueFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left - center;
      const y = clientY - rect.top - center;
      
      // Calculate angle and convert to value
      let angle = Math.atan2(y, x);
      
      // Convert angle to a value between 0 and 1
      // We need to adjust the angle to start from the top (π/2)
      angle = angle - Math.PI / 2;
      if (angle < 0) angle += 2 * Math.PI;
      
      // Now angle is between 0 and 2π, with 0 at the top
      // Convert to value between 0 and 1
      const newValue = 1 - (angle / (2 * Math.PI));
      onChange(newValue);
    },
    [center, onChange]
  );

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    calculateValueFromPosition(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    calculateValueFromPosition(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        calculateValueFromPosition(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        const touch = e.touches[0];
        calculateValueFromPosition(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, calculateValueFromPosition]);

  // Calculate the position of the knob
  const angle = 2 * Math.PI * value - Math.PI / 2;
  const knobX = center + radius * Math.cos(angle);
  const knobY = center + radius * Math.sin(angle);

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer touch-none select-none"
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        
        {/* Knob */}
        <circle
          cx={knobX}
          cy={knobY}
          r={knobSize / 2}
          fill={knobColor}
          stroke="white"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
};
