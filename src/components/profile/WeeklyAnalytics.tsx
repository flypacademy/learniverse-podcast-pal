
import React from "react";
import { DailyListeningData } from "@/hooks/useListeningAnalytics";

interface WeeklyAnalyticsProps {
  analytics: DailyListeningData[];
  loading: boolean;
}

const WeeklyAnalytics = ({ analytics, loading }: WeeklyAnalyticsProps) => {
  // Create data for chart
  const chartData = analytics.map(day => {
    // Extract the day of the week (e.g., 'M', 'T', etc.)
    const date = new Date(day.date);
    const dayOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
    
    return {
      day: dayOfWeek,
      minutes: day.minutesListened,
      // Calculate height percentage (max 100%)
      height: Math.min(100, (day.minutesListened / 60) * 100)
    };
  });

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-semibold text-gray-900">Learning Analytics</h3>
        <div className="badge bg-primary/10 text-primary">
          This Week
        </div>
      </div>
      
      <div className="h-48 flex items-end justify-between px-2">
        {/* Real bar chart representation with analytics data */}
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="w-6 bg-gradient-to-t from-primary to-brand-purple rounded-t-md"
              style={{ height: `${item.height}%` }}
            />
            <span className="text-xs text-gray-500 mt-1">
              {item.day}
            </span>
            <span className="text-xs font-medium">
              {item.minutes}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
