
import React from "react";
import StreakCalendar from "@/components/StreakCalendar";

interface WeeklyStreakSectionProps {
  streak: number;
  days: {
    date: string;
    completed: boolean;
    partial?: boolean;
  }[];
}

const WeeklyStreakSection = ({ streak, days }: WeeklyStreakSectionProps) => {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-semibold text-xl text-gray-900">
          Weekly Streak
        </h2>
        <span className="text-sm text-primary font-medium">
          +200 XP per day
        </span>
      </div>
      <StreakCalendar streak={streak} days={days} />
    </div>
  );
};

export default WeeklyStreakSection;
