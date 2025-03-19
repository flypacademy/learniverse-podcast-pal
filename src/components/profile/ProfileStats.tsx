
import React from "react";
import { BookOpen, Clock, Award } from "lucide-react";
import StatCard from "./StatCard";

interface ProfileStatsProps {
  totalPodcastsCompleted: number;
  totalHoursListened: number | string;
  totalXP?: number;
}

const ProfileStats = ({ totalPodcastsCompleted, totalHoursListened, totalXP = 0 }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard 
        label="Podcasts" 
        value={totalPodcastsCompleted} 
        icon={<BookOpen className="h-4 w-4 text-primary" />} 
      />
      <StatCard 
        label="Listened" 
        value={totalHoursListened} 
        icon={<Clock className="h-4 w-4 text-primary" />} 
      />
      <StatCard 
        label="XP Earned" 
        value={totalXP} 
        icon={<Award className="h-4 w-4 text-primary" />} 
      />
    </div>
  );
};

export default ProfileStats;
