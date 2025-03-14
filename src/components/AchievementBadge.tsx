
import React from "react";
import { Award } from "lucide-react";

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  unlocked: boolean;
  progress?: number; // 0-100
  color?: string;
}

const AchievementBadge = ({
  title,
  description,
  icon,
  unlocked,
  progress = 0,
  color = "bg-math-gradient"
}: AchievementBadgeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      <div 
        className={`
          h-16 w-16 rounded-full flex items-center justify-center 
          ${unlocked ? color : 'bg-gray-200'} 
          mb-2 relative overflow-hidden
        `}
      >
        {!unlocked && progress > 0 && (
          <div 
            className={`absolute bottom-0 left-0 ${color}`}
            style={{ 
              height: `${progress}%`, 
              width: '100%',
              opacity: 0.7
            }}
          />
        )}
        
        <div className={`${unlocked ? '' : 'text-gray-400'}`}>
          {icon || <Award className="h-8 w-8" />}
        </div>
        
        {unlocked && (
          <div className="absolute inset-0 bg-white/20 animate-pulse-subtle" />
        )}
      </div>
      
      <h4 className={`text-sm font-medium text-center ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </h4>
      
      <p className="text-xs text-gray-500 text-center mt-0.5">
        {unlocked ? description : `${progress}% completed`}
      </p>
    </div>
  );
};

export default AchievementBadge;
