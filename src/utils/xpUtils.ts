
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";

/**
 * XP amounts for different actions
 */
export const XP_AMOUNTS = {
  PODCAST_COMPLETION: 50,
  STREAK_DAY: 200,
  WEEKLY_STREAK: 1000,
  QUIZ_COMPLETION: 100,
  QUIZ_PERFECT: 150
};

/**
 * Calculate XP for listening time (10 XP per minute)
 */
export const calculateListeningXP = (seconds: number): number => {
  // 10 XP per minute = 1/6 XP per second
  return Math.floor((seconds / 60) * 10);
};

/**
 * Awards XP to a user and updates their experience
 */
export const awardXP = async (
  userId: string,
  amount: number,
  reason: string,
  showToast?: (props: { title: string; description: string }) => void
): Promise<boolean> => {
  try {
    console.log(`Awarding ${amount} XP to user ${userId} for ${reason}`);
    
    if (!userId) {
      console.error("Cannot award XP: No user ID provided");
      return false;
    }
    
    if (amount <= 0) {
      console.log("No XP to award (amount <= 0)");
      return false;
    }
    
    // First check if user has an XP record
    const { data: existingXP, error: fetchError } = await supabase
      .from('user_experience')
      .select('total_xp, weekly_xp')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching user XP:", fetchError);
      return false;
    }
    
    const timestamp = new Date().toISOString();
    
    if (existingXP) {
      console.log("Updating existing XP record:", existingXP.total_xp, "+", amount);
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_experience')
        .update({
          total_xp: existingXP.total_xp + amount,
          weekly_xp: existingXP.weekly_xp + amount,
          last_updated: timestamp
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error("Error updating XP:", updateError);
        return false;
      }
    } else {
      console.log("Creating new XP record with initial amount:", amount);
      // Create new record
      const { error: insertError } = await supabase
        .from('user_experience')
        .insert({
          user_id: userId,
          total_xp: amount,
          weekly_xp: amount,
          last_updated: timestamp
        });
      
      if (insertError) {
        console.error("Error inserting XP:", insertError);
        return false;
      }
    }
    
    // Log XP transaction (optional - could be used for history/audit)
    try {
      // Record the XP transaction (this is optional, you can add this table to track all XP gains)
      /*
      const { error: transactionError } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          reason: reason,
          created_at: timestamp
        });
      
      if (transactionError) {
        console.error("Error logging XP transaction:", transactionError);
        // Continue anyway - this is non-critical
      }
      */
    } catch (transactionErr) {
      console.error("Error in XP transaction logging:", transactionErr);
      // Continue anyway - the main XP update was successful
    }
    
    // Show toast notification if toast function is provided
    if (showToast) {
      showToast({
        title: "XP Earned!",
        description: `You earned ${amount} XP for ${reason}`
      });
    }
    
    return true;
  } catch (error) {
    console.error("Exception in awardXP:", error);
    return false;
  }
};

/**
 * Get current XP data for a user
 */
export const getUserXP = async (userId: string) => {
  try {
    if (!userId) {
      console.error("Cannot get XP: No user ID provided");
      return null;
    }
    
    const { data, error } = await supabase
      .from('user_experience')
      .select('total_xp, weekly_xp, last_updated')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user XP:", error);
      return null;
    }
    
    return data ? {
      totalXP: data.total_xp,
      weeklyXP: data.weekly_xp,
      lastUpdated: data.last_updated
    } : {
      totalXP: 0,
      weeklyXP: 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Exception in getUserXP:", error);
    return null;
  }
};

/**
 * Reset weekly XP for all users (could be scheduled to run weekly)
 */
export const resetWeeklyXP = async () => {
  try {
    const { error } = await supabase
      .from('user_experience')
      .update({ weekly_xp: 0 })
      .neq('weekly_xp', 0);
    
    if (error) {
      console.error("Error resetting weekly XP:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in resetWeeklyXP:", error);
    return false;
  }
};
