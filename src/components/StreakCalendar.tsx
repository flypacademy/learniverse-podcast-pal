
import React from "react";

interface StreakCalendarProps {
  streak: number;
  days: {
    date: string; // ISO date string
    completed: boolean;
    partial?: boolean;
  }[];
}

const StreakCalendar = ({ streak, days }: StreakCalendarProps) => {
  const today = new Date();
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  
  const getWeekDays = () => {
    const result = [];
    const startDate = new Date(today);
    
    // Find the Monday of the current week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    // Create array of dates for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayData = days.find(d => d.date === dateStr);
      
      result.push({
        date,
        dateStr,
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        completed: dayData?.completed || false,
        partial: dayData?.partial || false
      });
    }
    
    return result;
  };
  
  const weekDays = getWeekDays();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-gray-900">Week progress</h3>
        <div className="flex items-center text-sm">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            <span className="pulse mr-1.5 h-2 w-2 rounded-full bg-primary"></span>
            {streak} day streak
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((name, i) => (
          <div key={`header-${i}`} className="text-center text-xs text-gray-500">
            {name}
          </div>
        ))}
        
        {weekDays.map((day, i) => (
          <div 
            key={`day-${i}`} 
            className="flex items-center justify-center"
          >
            <div 
              className={`
                h-10 w-10 rounded-full flex items-center justify-center text-sm
                ${day.isToday ? 'border-2 border-primary' : ''}
                ${day.completed ? 'bg-primary text-white' : 
                  day.partial ? 'bg-primary/20 text-primary' : 
                  'bg-gray-100 text-gray-500'}
              `}
            >
              {day.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCalendar;
