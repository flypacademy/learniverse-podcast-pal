
import React from "react";
import Leaderboard from "@/components/Leaderboard";

interface LeaderboardSectionProps {
  leaderboardData: {
    id: string;
    name: string;
    xp: number;
    rank: number;
    change: "up" | "down" | "same";
  }[];
  currentUserId: string;
}

const LeaderboardSection = ({ leaderboardData, currentUserId }: LeaderboardSectionProps) => {
  return (
    <div className="glass-card p-4 rounded-xl">
      <Leaderboard 
        users={leaderboardData} 
        currentUserId={currentUserId} 
      />
    </div>
  );
};

export default LeaderboardSection;
