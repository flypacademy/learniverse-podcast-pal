
import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useXP } from "@/hooks/useXP";

interface UserHeaderProps {
  userName: string;
  totalXP?: number;
}

const UserHeader = ({ userName, totalXP: propTotalXP }: UserHeaderProps) => {
  const { toast } = useToast();
  const { totalXP, isLoading, refreshXPData } = useXP();
  const [displayLoading, setDisplayLoading] = useState(true);
  
  // Use prop totalXP if provided, otherwise use the totalXP from the hook
  const displayXP = propTotalXP !== undefined ? propTotalXP : totalXP ?? 0;
  
  // Add timeout to prevent indefinite loading state
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setDisplayLoading(false);
    }, 3000); // Set a 3-second timeout for loading state
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  // Refresh XP data when component mounts
  useEffect(() => {
    refreshXPData();
  }, [refreshXPData]);
  
  // Update loading state based on XP hook loading state
  useEffect(() => {
    if (!isLoading) {
      setDisplayLoading(false);
    }
  }, [isLoading]);
  
  // XP calculation information
  const xpInfo = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    toast({
      title: "XP System",
      description: "Earn 10 XP per minute of listening and 50 XP for completing podcasts. Maintain a daily streak for 200 XP per day!",
    });
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Hello, {userName}
        </h1>
        <p className="text-gray-500">Ready to learn today?</p>
      </div>
      <div 
        className="flex items-center bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full text-sm cursor-pointer"
        onClick={xpInfo}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        {displayLoading ? "Loading..." : `${displayXP} XP`}
      </div>
    </div>
  );
};

export default UserHeader;
