
import React from "react";
import { DailyListeningData } from "@/hooks/useListeningAnalytics";
import { 
  ChartContainer, 
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface WeeklyAnalyticsProps {
  analytics: DailyListeningData[];
  loading: boolean;
}

const WeeklyAnalytics = ({ analytics, loading }: WeeklyAnalyticsProps) => {
  // Create data for chart with proper day formatting
  const chartData = analytics.map(day => {
    // Extract the day of the week (e.g., 'M', 'T', etc.)
    const date = new Date(day.date);
    const dayOfWeek = ['S', 'S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
    
    return {
      day: dayOfWeek,
      minutes: day.minutesListened,
    };
  });

  // Find max minutes for Y axis domain
  const maxMinutes = Math.max(...chartData.map(data => data.minutes), 60);
  // Round up to nearest 15 for better increments (0, 15, 30, 45, 60)
  const yAxisMax = Math.ceil(maxMinutes / 15) * 15;

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-semibold text-gray-900">Learning Analytics</h3>
        <div className="badge bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          This Week
        </div>
      </div>
      
      <div className="h-60">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 10, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                domain={[0, yAxisMax]}
                tickCount={5}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip 
                formatter={(value) => [`${value} minutes`, 'Listened']} 
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
              />
              <Bar 
                dataKey="minutes"
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8884d8" />
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
