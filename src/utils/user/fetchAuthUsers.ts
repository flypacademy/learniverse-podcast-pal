
import { supabase } from "@/lib/supabase";

/**
 * Attempts to fetch users directly from Supabase Auth
 */
export async function fetchAuthUsers() {
  try {
    // Try getting the list of users (requires service role key)
    console.log("Attempting to fetch auth users...");
    
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching auth users:", error);
      return null;
    }
    
    return users;
  } catch (err) {
    console.error("Exception in fetchAuthUsers:", err);
    return null;
  }
}
