
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Attempts to fetch users directly from Supabase Auth
 * This requires either admin privileges or service_role key
 */
export async function fetchAuthUsers(): Promise<User[] | null> {
  try {
    console.log("Attempting to fetch auth users...");
    
    // Check if user is admin first
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
    
    if (adminCheckError || !isAdmin) {
      console.log("User doesn't have admin privileges:", adminCheckError?.message || "Not an admin");
      return null;
    }
    
    // If admin, try getting the list of users 
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching auth users:", error);
      return null;
    }
    
    if (!data.users || data.users.length === 0) {
      console.log("No auth users found");
      return [];
    }
    
    console.log(`Successfully retrieved ${data.users.length} auth users`);
    
    // Transform to our User type
    return data.users.map(user => ({
      id: user.id,
      email: user.email || `user-${user.id.substring(0, 8)}@unknown.com`,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || "Unknown",
      total_xp: 0 // Will be populated later
    }));
  } catch (err) {
    console.error("Exception in fetchAuthUsers:", err);
    return null;
  }
}
