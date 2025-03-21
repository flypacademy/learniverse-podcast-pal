import { supabase } from "@/lib/supabase";

interface ActivityDay {
  date: string;
  completed: boolean;
  partial?: boolean;
}

/**
 * Fetches user activity data to calculate streaks
 */
export const fetchUserActivity = async (): Promise<ActivityDay[]> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log("No user session found, can't fetch streak data");
      return generateDefaultActivityDays();
    }
    
    const userId = session.user.id;
    
    // Get start of the week (Monday)
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get end of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Format dates for Supabase query
    const startDate = startOfWeek.toISOString();
    const endDate = endOfWeek.toISOString();
    
    // Fetch completed podcasts within date range
    const { data: activityData, error } = await supabase
      .from('user_progress')
      .select('created_at, completed, last_position')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error fetching user activity:", error);
      return generateDefaultActivityDays();
    }
    
    // Create a map of days with activity
    const activityMap = new Map<string, { completed: boolean, partial: boolean }>();
    
    // Group activity by day
    activityData?.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      
      // If we already have a completed activity for this day, keep it completed
      const existing = activityMap.get(date);
      if (existing?.completed) {
        return;
      }
      
      activityMap.set(date, {
        completed: activity.completed,
        partial: !activity.completed && activity.last_position > 0
      });
    });
    
    // Generate activity days for the week
    const activityDays: ActivityDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const activity = activityMap.get(dateStr);
      
      activityDays.push({
        date: dateStr,
        completed: activity?.completed || false,
        partial: activity?.partial || false
      });
    }
    
    return activityDays;
    
  } catch (err) {
    console.error("Error in fetchUserActivity:", err);
    return generateDefaultActivityDays();
  }
};

/**
 * Calculate current streak from activity days
 */
export const calculateStreak = (activityDays: ActivityDay[]): number => {
  // Use reverse order to count from most recent day
  const sortedDays = [...activityDays].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the most recent day
  const today = new Date().toISOString().split('T')[0];
  
  let currentStreak = 0;
  let previousDate: Date | null = null;
  
  for (const day of sortedDays) {
    // Skip future days
    if (day.date > today) continue;
    
    // If the day isn't completed (or at least partial), break streak
    if (!day.completed && !day.partial) break;
    
    const currentDate = new Date(day.date);
    
    // Check if this is consecutive with previous date
    if (previousDate) {
      const diffTime = previousDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If not consecutive, break the streak
      if (diffDays !== 1) break;
    }
    
    // Count this day and move to next
    currentStreak++;
    previousDate = currentDate;
  }
  
  return currentStreak;
};

/**
 * Generate default activity days for when data can't be fetched
 */
const generateDefaultActivityDays = (): ActivityDay[] => {
  const today = new Date();
  const result: ActivityDay[] = [];
  
  // Find the Monday of the current week
  const startDate = new Date(today);
  const day = startDate.getDay();
  const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
  startDate.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    
    result.push({
      date: dateStr,
      completed: isPast && !isToday,
      partial: isToday
    });
  }
  
  return result;
};
