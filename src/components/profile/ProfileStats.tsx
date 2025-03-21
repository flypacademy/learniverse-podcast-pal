
import React from "react";
import { BookOpen, Clock } from "lucide-react";
import StatCard from "./StatCard";

interface ProfileStatsProps {
  totalPodcastsCompleted: number;
  totalHoursListened: string;
  loading?: boolean;
}

const ProfileStats = ({ totalPodcastsCompleted, totalHoursListened, loading = false }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard 
        label="Podcasts" 
        value={loading ? "Loading..." : totalPodcastsCompleted} 
        icon={<BookOpen className="h-4 w-4 text-primary" />} 
      />
      <StatCard 
        label="Listened" 
        value={totalHoursListened} 
        icon={<Clock className="h-4 w-4 text-primary" />} 
      />
    </div>
  );
};

export default ProfileStats;
