
import React from "react";
import { DailyListeningData } from "@/hooks/useListeningAnalytics";
import { 
  ChartContainer, 
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";

interface WeeklyAnalyticsProps {
  analytics: DailyListeningData[];
  loading: boolean;
}

const WeeklyAnalytics = ({ analytics, loading }: WeeklyAnalyticsProps) => {
  // Create data for chart with proper day labeling
  const chartData = analytics.map(day => {
    const date = new Date(day.date);
    // Format as single letter day name
    const dayOfWeek = format(date, 'E')[0];
    
    return {
      day: dayOfWeek,
      fullDay: format(date, 'E'), // Full day name for tooltip
      minutes: day.minutesListened,
      date: format(date, 'MMM d, yyyy')
    };
  });

  // Find max minutes for Y axis domain with sensible min/max values
  const maxMinutes = Math.max(...chartData.map(data => data.minutes), 15);
  // Round up to nearest multiple of 15 and ensure at least 60m as max for better visualization
  const yAxisMax = Math.max(60, Math.ceil(maxMinutes / 15) * 15);
  
  // Set y-axis tick values to match the design
  const yAxisTicks = [0, 15, 30, 45, 60].filter(tick => tick <= yAxisMax);

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-semibold text-lg text-gray-900">Learning Analytics</h3>
        <div className="badge bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          This Week
        </div>
      </div>
      
      <div className="h-64"> {/* Increased height for better visualization */}
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
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
                ticks={yAxisTicks}
                tickFormatter={(value) => `${value}m`}
                width={40}
              />
              <Tooltip 
                formatter={(value) => [`${value} minutes`, 'Listened']} 
                labelFormatter={(_, data) => {
                  const item = data[0]?.payload;
                  return `${item?.fullDay || ''} - ${item?.date || ''}`;
                }}
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
                barSize={24}
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
