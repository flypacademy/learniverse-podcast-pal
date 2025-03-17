
import React from "react";
import { Link } from "react-router-dom";
import { Headphones } from "lucide-react";

interface TodaysGoalButtonProps {
  handleLinkClick: () => void;
}

const TodaysGoalButton = ({ handleLinkClick }: TodaysGoalButtonProps) => {
  return (
    <Link to="/goals" onClick={handleLinkClick}>
      <div className="glass-card p-4 rounded-xl hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-primary to-blue-600 flex-shrink-0 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          
          <div className="ml-4">
            <h3 className="font-medium">Set Today's Listening Goal</h3>
            <p className="text-sm text-gray-500">
              Choose your podcast goal for today and start earning XP
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TodaysGoalButton;
