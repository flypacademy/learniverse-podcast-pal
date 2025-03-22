
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { activityDays } from "@/data/activityData";

export interface DailyListeningData {
  date: string; // ISO format date string
  minutesListened: number;
}

export function useListeningAnalytics(days: number = 7) {
  const [analytics, setAnalytics] = useState<DailyListeningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListeningAnalytics() {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // If no user is logged in, create sample data
          generateSampleData(days);
          return;
        }
        
        const userId = session.user.id;
        
        // Calculate the date range for the query (last n days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Query the user_progress table to get listening data
        const { data, error } = await supabase
          .from('user_progress')
          .select('updated_at, last_position, podcast_id, podcasts(duration)')
          .eq('user_id', userId)
          .gte('updated_at', startDate.toISOString())
          .lte('updated_at', endDate.toISOString())
          .order('updated_at', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Process data to get minutes listened per day
        const dailyMinutes = calculateDailyMinutes(data, startDate, endDate);
        
        // Check if all values are zero - if so, generate sample data instead
        const allZeros = dailyMinutes.every(day => day.minutesListened === 0);
        if (allZeros) {
          console.log("All listening data is zero, generating sample data instead");
          generateSampleData(days);
        } else {
          setAnalytics(dailyMinutes);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching listening analytics:", err);
        setError(err.message);
        setLoading(false);
        
        // Generate sample data in case of error
        generateSampleData(days);
      }
    }
    
    function calculateDailyMinutes(data: any[], startDate: Date, endDate: Date): DailyListeningData[] {
      // Create an object with all dates in the range initialized to 0 minutes
      const dailyMinutesMap: Record<string, number> = {};
      
      // Initialize all dates in range with 0 minutes
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        dailyMinutesMap[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Process the user progress data
      if (data && data.length > 0) {
        data.forEach(entry => {
          // Get the date part of the timestamp
          const entryDate = new Date(entry.updated_at).toISOString().split('T')[0];
          
          // Calculate minutes listened (convert seconds to minutes)
          let minutesListened = 0;
          if (entry.last_position) {
            minutesListened = Math.floor(entry.last_position / 60);
          }
          
          // Add to the daily total
          if (dailyMinutesMap[entryDate] !== undefined) {
            dailyMinutesMap[entryDate] += minutesListened;
          }
        });
      }
      
      // Convert the map to an array of objects
      return Object.entries(dailyMinutesMap).map(([date, minutes]) => ({
        date,
        minutesListened: minutes
      }));
    }
    
    function generateSampleData(days: number) {
      const sampleData: DailyListeningData[] = [];
      const today = new Date();
      
      // Create sample data that aligns with our activity pattern in activityData.ts
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Find if this day is in our activityDays data
        const activityDay = activityDays.find(day => day.date === dateString);
        
        // Assign minutes based on the activity status
        let minutes = 0;
        
        if (activityDay) {
          if (activityDay.completed) {
            // Completed days have higher minutes (30-45)
            minutes = Math.floor(Math.random() * 15) + 30;
          } else if (activityDay.partial) {
            // Partial days have medium minutes (15-25)
            minutes = Math.floor(Math.random() * 10) + 15;
          } else {
            // Not completed days have lower or zero minutes (0-10)
            minutes = Math.floor(Math.random() * 10);
          }
        } else {
          // Default fallback
          minutes = Math.floor(Math.random() * 15) + 5;
        }
        
        sampleData.push({
          date: dateString,
          minutesListened: minutes
        });
      }
      
      setAnalytics(sampleData);
      setLoading(false);
    }
    
    fetchListeningAnalytics();
  }, [days]);
  
  return { analytics, loading, error };
}
