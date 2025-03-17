
import React from "react";
import AchievementBadge from "@/components/AchievementBadge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  icon: React.ReactNode;
  color: string;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

const AchievementsSection = ({ achievements }: AchievementsSectionProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display font-semibold text-xl text-gray-900">
          Achievements
        </h2>
        <div className="badge bg-primary/10 text-primary">
          {achievements.filter(a => a.unlocked).length}/{achievements.length}
        </div>
      </div>
      
      <div className="glass-card p-4 rounded-xl">
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              {...achievement}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsSection;
