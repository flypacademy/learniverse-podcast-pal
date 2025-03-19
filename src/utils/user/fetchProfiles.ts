
import { supabase } from "@/lib/supabase";

/**
 * Fetches user profiles from the database
 */
export async function fetchProfiles() {
  try {
    console.log("Fetching user profiles...");
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} profiles`);
    return data || [];
  } catch (err) {
    console.error("Exception in fetchProfiles:", err);
    return [];
  }
}
