
import React from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserHeaderProps {
  userName: string;
  totalXP: number;
}

const UserHeader = ({ userName, totalXP }: UserHeaderProps) => {
  const { toast } = useToast();
  
  // XP calculation information
  const xpInfo = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    toast({
      title: "XP System",
      description: "Earn 10 XP per minute of listening and 200 XP for maintaining a daily streak. Complete 7 consecutive days for 1000 XP bonus!",
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
        {totalXP} XP
      </div>
    </div>
  );
};

export default UserHeader;
