
import React from "react";
import Leaderboard from "@/components/Leaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaderboardSection = () => {
  const { leaderboardData, currentUserId, loading, error } = useLeaderboard();
  
  if (error) {
    return (
      <Card className="glass-card rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load leaderboard data: {error}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-card rounded-xl overflow-hidden">
      <CardContent className="p-4">
        <Leaderboard 
          users={leaderboardData} 
          currentUserId={currentUserId}
          isLoading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default LeaderboardSection;
