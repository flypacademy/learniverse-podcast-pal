
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Fetches user profiles from the database
 * This is our fallback when we can't access auth.users directly
 */
export async function fetchProfiles(): Promise<Partial<User>[]> {
  try {
    console.log("Fetching user profiles...");
    
    // First try to get profiles with authentication metadata
    const { data: authData, error: authError } = await supabase
      .from('profiles')
      .select('*');
    
    // If profiles table exists and has data, use it
    if (!authError && authData && authData.length > 0) {
      console.log(`Found ${authData.length} profiles from profiles table`);
      return authData.map(profile => ({
        id: profile.id,
        email: profile.email || `user-${profile.id.substring(0, 8)}@example.com`,
        created_at: profile.created_at,
        display_name: profile.full_name || profile.display_name || `User ${profile.id.substring(0, 6)}`,
        total_xp: 0 // Will be populated later
      }));
    }
    
    // If profiles doesn't exist or is empty, try user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching user_profiles:", error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} profiles from user_profiles table`);
    return data?.map(profile => ({
      id: profile.id,
      display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
      created_at: profile.created_at || new Date().toISOString(),
      avatar_url: profile.avatar_url,
    })) || [];
  } catch (err) {
    console.error("Exception in fetchProfiles:", err);
    return [];
  }
}
