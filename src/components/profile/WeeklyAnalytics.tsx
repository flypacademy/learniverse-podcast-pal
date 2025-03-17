
import React from "react";
import { DailyListeningData } from "@/hooks/useListeningAnalytics";
import { 
  ChartContainer, 
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

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
    };
  });

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-semibold text-gray-900">Learning Analytics</h3>
        <div className="badge bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          This Week
        </div>
      </div>
      
      <div className="h-48">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Bar 
                dataKey="minutes"
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
                barSize={24}
                label={{ 
                  position: 'bottom', 
                  offset: 10,
                  fill: '#64748b',
                  fontSize: 12,
                  formatter: (value) => `${value}m` 
                }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8884d8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
