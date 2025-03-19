
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Fetches user profiles from the database
 * This is our fallback when we can't access auth.users directly
 */
export async function fetchProfiles(): Promise<Partial<User>[]> {
  try {
    console.log("Fetching user profiles...");
    
    // Try to get user data from auth.users via RPC if available
    const { data: authUsers, error: authError } = await supabase
      .rpc('get_user_emails');
    
    // If we have auth user data via RPC, use it
    if (!authError && authUsers && authUsers.length > 0) {
      console.log(`Found ${authUsers.length} users from get_user_emails RPC`);
      const emailMap = new Map(authUsers.map(u => [u.id, u.email]));
      
      // Get profile data to merge with auth data
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');
      
      // Merge data from both sources
      return (profiles || []).map(profile => {
        const email = emailMap.get(profile.id);
        return {
          id: profile.id,
          email: email || "", // Use the actual email from auth RPC
          created_at: profile.created_at,
          display_name: profile.display_name || (email ? email.split('@')[0] : `User ${profile.id.substring(0, 6)}`),
          total_xp: 0
        };
      });
    }
    
    // First try to get profiles with authentication metadata
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    // If profiles table exists and has data, use it
    if (!profileError && profileData && profileData.length > 0) {
      console.log(`Found ${profileData.length} profiles from profiles table`);
      return profileData.map(profile => ({
        id: profile.id,
        email: profile.email || "", // Don't create fake emails
        created_at: profile.created_at,
        display_name: profile.full_name || profile.display_name || `User ${profile.id.substring(0, 6)}`,
        total_xp: 0
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
    })) || [];
  } catch (err) {
    console.error("Exception in fetchProfiles:", err);
    return [];
  }
}
