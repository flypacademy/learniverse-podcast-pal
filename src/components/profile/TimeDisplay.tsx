
import React from "react";
import { ListeningStats } from "@/types/xp";

interface TimeDisplayProps {
  stats?: ListeningStats | null;
  statsLoading?: boolean;
}

export const formatListeningTime = (stats?: ListeningStats | null): string => {
  const minutes = stats?.totalMinutes ?? 0;
  const seconds = stats?.totalSeconds ?? 0;
  
  // If we have seconds data but less than a minute
  if (seconds > 0 && seconds < 60) {
    return `${seconds}s`;
  }
  
  if (minutes === 0) {
    return "None";
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ stats, statsLoading }) => {
  if (statsLoading) {
    return "Loading...";
  }
  return formatListeningTime(stats);
};

export default TimeDisplay;
