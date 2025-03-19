
import { supabase } from "@/lib/supabase";

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
    
    // First check if user has an XP record
    const { data: existingXP, error: fetchError } = await supabase
      .from('user_experience')
      .select('total_xp, weekly_xp')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching user XP:", fetchError);
      return false;
    }
    
    if (existingXP) {
      console.log("Updating existing XP record:", existingXP.total_xp, "+", amount);
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_experience')
        .update({
          total_xp: existingXP.total_xp + amount,
          weekly_xp: existingXP.weekly_xp + amount,
          last_updated: new Date().toISOString()
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
          last_updated: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Error inserting XP:", insertError);
        return false;
      }
    }
    
    // Show toast notification if toast function is provided
    if (showToast) {
      showToast({
        title: "XP Earned!",
        description: `You earned ${amount} XP for ${reason}`,
      });
    }
    
    return true;
  } catch (error) {
    console.error("Exception in awardXP:", error);
    return false;
  }
};

/**
 * Calculate XP for listening time (10 XP per minute)
 */
export const calculateListeningXP = (seconds: number): number => {
  // 10 XP per minute = 1/6 XP per second
  return Math.floor((seconds / 60) * 10);
};

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
