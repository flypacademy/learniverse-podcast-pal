
import React from "react";
import Leaderboard from "@/components/Leaderboard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowClockwise } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeaderboardSection = () => {
  const { leaderboardData, currentUserId, loading, error } = useLeaderboard();
  
  const handleRefresh = () => {
    // Force a page refresh
    window.location.reload();
  };
  
  if (error) {
    return (
      <Card className="glass-card rounded-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-500">Failed to load leaderboard data: {error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
              <ArrowClockwise className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
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
