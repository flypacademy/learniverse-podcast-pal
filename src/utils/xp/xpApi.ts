
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";

/**
 * Fetches total XP from the new user_xp table
 */
export const fetchNewXPTotal = async (userId: string): Promise<number | null> => {
  try {
    const { data: xpData, error: xpError } = await supabase
      .from('user_xp')
      .select('amount')
      .eq('user_id', userId);
    
    if (xpError) {
      // If this table doesn't exist, throw error to try legacy table
      if (xpError.code === '42P01') { // PostgreSQL error code for "relation does not exist"
        console.log("user_xp table does not exist yet, checking legacy table");
        throw new Error("Table not found");
      } else {
        throw xpError;
      }
    }
    
    const total = xpData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    console.log("Found XP in user_xp table:", total);
    return total;
  } catch (err) {
    throw err; // Re-throw for the caller to handle
  }
};

/**
 * Fetches XP from the legacy user_experience table
 */
export const fetchLegacyXP = async (userId: string): Promise<number | null> => {
  try {
    const { data: legacyXP, error: legacyError } = await supabase
      .from('user_experience')
      .select('total_xp')
      .eq('user_id', userId)
      .single();
    
    if (legacyError && legacyError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching legacy XP:", legacyError);
      throw legacyError;
    } else if (legacyXP) {
      console.log("Found XP in legacy table:", legacyXP.total_xp);
      return legacyXP.total_xp;
    } else {
      // If no legacy data, return 0
      console.log("No XP data found in legacy table");
      return 0;
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Award XP to user using the new user_xp table
 */
export const awardNewXP = async (
  userId: string,
  amount: number,
  reason: XPReason
): Promise<boolean> => {
  try {
    const { error: insertError } = await supabase
      .from('user_xp')
      .insert([
        {
          user_id: userId,
          amount: amount,
          reason: reason,
          created_at: new Date().toISOString()
        }
      ]);
    
    if (insertError) {
      console.error("Error awarding XP to new table:", insertError);
      throw insertError;
    }
    
    console.log(`Awarded ${amount} XP for ${reason} to new table`);
    return true;
  } catch (err) {
    throw err;
  }
};

/**
 * Award XP to user using the legacy user_experience table
 */
export const awardLegacyXP = async (
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> => {
  try {
    // Check if user has an existing record
    const { data: legacyXP } = await supabase
      .from('user_experience')
      .select('total_xp, weekly_xp')
      .eq('user_id', userId)
      .single();
    
    if (legacyXP) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_experience')
        .update({
          total_xp: legacyXP.total_xp + amount,
          weekly_xp: legacyXP.weekly_xp + amount,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error("Error updating legacy XP:", updateError);
        throw updateError;
      }
      
      console.log(`Added ${amount} XP for ${reason} to legacy table`);
      return true;
    } else {
      // Insert new record in legacy table
      const { error: createError } = await supabase
        .from('user_experience')
        .insert([{
          user_id: userId,
          total_xp: amount,
          weekly_xp: amount,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);
      
      if (createError) {
        console.error("Error creating legacy XP record:", createError);
        throw createError;
      }
      
      console.log(`Added ${amount} XP for ${reason} to new legacy record`);
      return true;
    }
  } catch (err) {
    throw err;
  }
};
