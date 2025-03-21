
import React, { useState, useEffect } from "react";
import ProgressBar from "@/components/ProgressBar";

interface UserData {
  name: string;
  email: string;
  xp: number;
  level: number;
  nextLevelXP: number;
  progress: number;
}

interface UserCardProps {
  userData: UserData;
  loading?: boolean;
}

const UserCard = ({ userData, loading = false }: UserCardProps) => {
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show loading indicator after a short delay to prevent flickering
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (loading) {
      // Delay showing loading state to prevent flickering
      timer = setTimeout(() => {
        setShowLoading(true);
      }, 300); // Short delay before showing loading state
    } else {
      setShowLoading(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);
  
  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white flex items-center justify-center font-display font-bold text-xl">
          {userData.name.charAt(0)}
        </div>
        
        <div className="flex-1">
          <h2 className="font-display font-semibold text-xl">
            {userData.name}
          </h2>
          <p className="text-gray-500 text-sm">{userData.email}</p>
          
          <div className="mt-1.5">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">Level {userData.level}</span>
              <span>
                {showLoading ? "Loading..." : `${userData.xp} / ${userData.nextLevelXP} XP`}
              </span>
            </div>
            <ProgressBar 
              value={userData.progress} 
              size="md"
              color="bg-gradient-to-r from-brand-purple to-brand-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
