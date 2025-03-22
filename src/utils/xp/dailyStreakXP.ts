
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";
import { awardNewXP, awardLegacyXP } from "@/utils/xp/xpApi";

const STREAK_DAY_XP = 200;

/**
 * Check if a user has already been awarded XP for today
 */
export const hasReceivedDailyXP = async (userId: string): Promise<boolean> => {
  try {
    // Format today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user has a streak record for today with XP awarded
    const { data, error } = await supabase
      .from('user_daily_streaks')
      .select('xp_awarded')
      .eq('user_id', userId)
      .eq('streak_date', today)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking daily streak:", error);
      return false;
    }
    
    return data?.xp_awarded || false;
  } catch (err) {
    console.error("Exception in hasReceivedDailyXP:", err);
    return false;
  }
};

/**
 * Record a listening activity for today and award XP if it's the first time today
 */
export const recordDailyStreak = async (userId: string): Promise<boolean> => {
  try {
    // Format today's date in ISO format (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already has a streak record for today
    const { data: existingRecord, error: checkError } = await supabase
      .from('user_daily_streaks')
      .select('id, xp_awarded')
      .eq('user_id', userId)
      .eq('streak_date', today)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking daily streak record:", checkError);
      return false;
    }
    
    // If user already received XP today, don't award again
    if (existingRecord?.xp_awarded) {
      console.log("User already received daily streak XP today");
      return false;
    }
    
    if (existingRecord) {
      // Update existing record to mark XP as awarded
      const { error: updateError } = await supabase
        .from('user_daily_streaks')
        .update({ xp_awarded: true })
        .eq('id', existingRecord.id);
      
      if (updateError) {
        console.error("Error updating daily streak record:", updateError);
        return false;
      }
    } else {
      // Create new record for today
      const { error: insertError } = await supabase
        .from('user_daily_streaks')
        .insert({
          user_id: userId,
          streak_date: today,
          xp_awarded: true
        });
      
      if (insertError) {
        console.error("Error creating daily streak record:", insertError);
        return false;
      }
    }
    
    // Award XP for streak day
    try {
      // Try with new XP system first
      await awardNewXP(userId, STREAK_DAY_XP, XPReason.STREAK_DAY);
      console.log(`Awarded ${STREAK_DAY_XP} XP for daily streak`);
      return true;
    } catch (err) {
      // Fall back to legacy XP system
      try {
        await awardLegacyXP(userId, STREAK_DAY_XP, XPReason.STREAK_DAY);
        console.log(`Awarded ${STREAK_DAY_XP} XP for daily streak using legacy system`);
        return true;
      } catch (awardErr) {
        console.error("Failed to award streak XP:", awardErr);
        return false;
      }
    }
  } catch (err) {
    console.error("Exception in recordDailyStreak:", err);
    return false;
  }
};

/**
 * Check if user has listened every day this week and award bonus XP
 */
export const checkWeeklyStreakCompletion = async (userId: string): Promise<boolean> => {
  try {
    // Get dates for the last 7 days
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Check if user has a streak record for each day of the week
    const { data, error } = await supabase
      .from('user_daily_streaks')
      .select('streak_date')
      .eq('user_id', userId)
      .in('streak_date', dates);
    
    if (error) {
      console.error("Error checking weekly streak:", error);
      return false;
    }
    
    // If user has listened every day this week (7 days), award bonus XP
    if (data && data.length === 7) {
      // Award weekly streak bonus (1000 XP)
      const WEEKLY_STREAK_XP = 1000;
      
      try {
        // Try with new XP system first
        await awardNewXP(userId, WEEKLY_STREAK_XP, XPReason.WEEKLY_STREAK);
        console.log(`Awarded ${WEEKLY_STREAK_XP} XP for weekly streak bonus`);
        return true;
      } catch (err) {
        // Fall back to legacy XP system
        try {
          await awardLegacyXP(userId, WEEKLY_STREAK_XP, XPReason.WEEKLY_STREAK);
          console.log(`Awarded ${WEEKLY_STREAK_XP} XP for weekly streak bonus using legacy system`);
          return true;
        } catch (awardErr) {
          console.error("Failed to award weekly streak XP:", awardErr);
          return false;
        }
      }
    }
    
    return false;
  } catch (err) {
    console.error("Exception in checkWeeklyStreakCompletion:", err);
    return false;
  }
};
