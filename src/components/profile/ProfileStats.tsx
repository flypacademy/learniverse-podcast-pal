
import React from "react";
import { BookOpen, Clock } from "lucide-react";
import StatCard from "./StatCard";

interface ProfileStatsProps {
  totalPodcastsCompleted: number;
  totalHoursListened: number;
}

const ProfileStats = ({ totalPodcastsCompleted, totalHoursListened }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        label="Podcasts" 
        value={totalPodcastsCompleted} 
        icon={<BookOpen className="h-4 w-4 text-primary" />} 
      />
      <StatCard 
        label="Hours" 
        value={totalHoursListened} 
        icon={<Clock className="h-4 w-4 text-primary" />} 
      />
    </div>
  );
};

export default ProfileStats;
