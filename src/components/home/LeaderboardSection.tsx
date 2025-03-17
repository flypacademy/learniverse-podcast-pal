
import React from "react";
import Leaderboard from "@/components/Leaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardSection = () => {
  const { leaderboardData, currentUserId, loading, error } = useLeaderboard();
  
  if (error) {
    return (
      <div className="glass-card p-4 rounded-xl">
        <p className="text-red-500">Failed to load leaderboard data.</p>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-4 rounded-xl">
      <Leaderboard 
        users={leaderboardData} 
        currentUserId={currentUserId}
        isLoading={loading}
      />
    </div>
  );
};

export default LeaderboardSection;
