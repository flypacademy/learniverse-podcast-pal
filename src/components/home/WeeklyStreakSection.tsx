
import React from "react";
import StreakCalendar from "@/components/StreakCalendar";

interface WeeklyStreakSectionProps {
  streak: number;
  days: {
    date: string;
    completed: boolean;
    partial?: boolean;
  }[];
  loading?: boolean;
}

const WeeklyStreakSection = ({ streak, days, loading = false }: WeeklyStreakSectionProps) => {
  // Check for full weekly streak (7 days)
  const hasFullWeekStreak = days.filter(day => day.completed).length === 7;
  
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-semibold text-xl text-gray-900">
          Weekly Streak
        </h2>
        <div className="text-sm text-primary font-medium flex flex-col items-end">
          <span>+200 XP per day</span>
          {hasFullWeekStreak && (
            <span className="text-xs text-green-600">+1000 XP for full week!</span>
          )}
        </div>
      </div>
      <StreakCalendar 
        streak={streak} 
        days={days} 
        loading={loading}
      />
    </div>
  );
};

export default WeeklyStreakSection;
