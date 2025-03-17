
import React from "react";
import { Trophy, Medal, Crown, ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeaderboardUser {
  id: string;
  display_name: string;
  total_xp: number;
  avatar_url?: string;
  rank: number;
  change?: "up" | "down" | "same";
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserId: string;
  isLoading?: boolean;
}

const Leaderboard = ({ users, currentUserId, isLoading = false }: LeaderboardProps) => {
  // Sort users by XP descending
  const sortedUsers = [...users].sort((a, b) => b.total_xp - a.total_xp);
  
  // Find current user's position
  const currentUserIndex = sortedUsers.findIndex(user => user.id === currentUserId);
  
  // Get the top users and users around the current user
  const topUsers = sortedUsers.slice(0, 3);
  
  let relevantUsers: LeaderboardUser[] = [];
  if (currentUserIndex >= 3) {
    // If user is not in top 3, show their position and users around them
    const start = Math.max(0, currentUserIndex - 1);
    const end = Math.min(sortedUsers.length, currentUserIndex + 2);
    relevantUsers = sortedUsers.slice(start, end);
  }
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Leaderboard</h3>
          <span className="text-sm text-primary font-medium">Loading...</span>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between gap-2 mb-4">
            {[1, 2, 3].map(index => (
              <div key={index} className="flex-1 p-3 rounded-lg bg-gray-100 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Leaderboard</h3>
        <span className="text-sm text-primary font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-1" /> Top Students
        </span>
      </div>
      
      {/* Top 3 Users */}
      <div className="flex justify-between gap-2 mb-4">
        {topUsers.map((user, index) => (
          <div 
            key={user.id} 
            className={`flex-1 p-3 rounded-lg ${user.id === currentUserId ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50 dark:bg-gray-800'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {index === 0 && (
                  <Crown className="absolute -top-3 left-1/2 transform -translate-x-1/2 h-5 w-5 text-yellow-500" />
                )}
                
                <Avatar className={`h-10 w-10 ${getRankBgColor(index)}`}>
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.display_name} />
                  ) : (
                    <AvatarFallback className="text-white font-bold">
                      {user.display_name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${getRankBgColor(index)} flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800`}>
                  {index + 1}
                </div>
              </div>
              
              <p className="font-medium text-sm mt-2 truncate w-full">{user.display_name}</p>
              <p className="text-xs font-bold text-primary mt-1">{user.total_xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Users around current user */}
      {relevantUsers.length > 0 && (
        <div className="space-y-2 mt-3">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Ranking</h4>
          
          {relevantUsers.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center p-2 rounded-lg ${user.id === currentUserId ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50 dark:bg-gray-800'}`}
            >
              <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 text-sm font-bold">
                {user.rank}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{user.display_name}</p>
              </div>
              
              <div className="flex items-center">
                <p className="font-bold text-primary mr-2">{user.total_xp.toLocaleString()} XP</p>
                
                {user.change === "up" && (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                )}
                {user.change === "down" && (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                {user.change === "same" && (
                  <Minus className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get background color based on rank
const getRankBgColor = (index: number): string => {
  switch (index) {
    case 0:
      return "bg-yellow-500"; // Gold
    case 1:
      return "bg-gray-400"; // Silver
    case 2:
      return "bg-amber-700"; // Bronze
    default:
      return "bg-primary";
  }
};

export default Leaderboard;
