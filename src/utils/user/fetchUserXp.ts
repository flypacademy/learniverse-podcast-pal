
import { supabase } from "@/lib/supabase";

/**
 * Fetches user XP data
 */
export async function fetchUserXp() {
  try {
    console.log("Fetching user XP data...");
    
    const { data, error } = await supabase
      .from('user_experience')
      .select('user_id, total_xp');
    
    if (error) {
      console.error("Error fetching user XP:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} XP records`);
    return data || [];
  } catch (err) {
    console.error("Exception in fetchUserXp:", err);
    return [];
  }
}
