
import React from "react";
import { ListeningStats } from "@/types/xp";

interface TimeDisplayProps {
  stats?: ListeningStats | null;
  statsLoading?: boolean;
}

export const formatListeningTime = (stats?: ListeningStats | null): string => {
  const minutes = stats?.totalMinutes ?? 0;
  
  if (minutes === 0) {
    return "Just started";
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
