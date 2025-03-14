
import React from "react";
import { Trophy, Medal, Crown, ArrowUp, Sparkles } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar?: string;
  rank: number;
  change?: "up" | "down" | "same";
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserId: string;
}

const Leaderboard = ({ users, currentUserId }: LeaderboardProps) => {
  // Sort users by XP descending
  const sortedUsers = [...users].sort((a, b) => b.xp - a.xp);
  
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
            className={`flex-1 p-3 rounded-lg ${user.id === currentUserId ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {index === 0 && (
                  <Crown className="absolute -top-3 left-1/2 transform -translate-x-1/2 h-5 w-5 text-yellow-500" />
                )}
                
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRankBgColor(index)}`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <span className="text-white font-bold">{user.name.charAt(0)}</span>
                  )}
                </div>
                
                <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${getRankBgColor(index)} flex items-center justify-center text-white text-xs font-bold border-2 border-white`}>
                  {index + 1}
                </div>
              </div>
              
              <p className="font-medium text-sm mt-2 truncate w-full">{user.name}</p>
              <p className="text-xs font-bold text-primary mt-1">{user.xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Users around current user */}
      {relevantUsers.length > 0 && (
        <div className="space-y-2 mt-3">
          <h4 className="text-sm font-medium text-gray-500">Your Ranking</h4>
          
          {relevantUsers.map((user) => (
            <div 
              key={user.id} 
              className={`flex items-center p-2 rounded-lg ${user.id === currentUserId ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50'}`}
            >
              <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-sm font-bold">
                {user.rank}
              </div>
              
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div className="flex items-center">
                <p className="font-bold text-primary mr-2">{user.xp.toLocaleString()} XP</p>
                
                {user.change === "up" && (
                  <ArrowUp className="h-4 w-4 text-green-500" />
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
