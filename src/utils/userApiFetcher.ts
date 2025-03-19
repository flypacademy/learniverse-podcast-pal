
import { User } from "@/types/user";
import { fetchAuthUsers } from "./user/fetchAuthUsers";
import { fetchProfiles } from "./user/fetchProfiles";
import { fetchUserXp } from "./user/fetchUserXp";
import { createSampleUser } from "./user/createSampleUser";
import { supabase } from "@/lib/supabase";

/**
 * Fetches users from Supabase using the most reliable available method
 * Returns both auth users and profile data when available
 */
export async function fetchUsers() {
  try {
    console.log("Starting to fetch users from Supabase...");
    
    // First check if we have an active session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.log("No active session found, returning sample user");
      return { 
        data: [createSampleUser()], 
        error: "Authentication required"
      };
    }
    
    // Try each data source in order of completeness
    let authUsers = await fetchAuthUsers();
    const profiles = await fetchProfiles();
    const xpData = await fetchUserXp();
    
    let combinedUsers: User[] = [];
    
    // If we have auth users (admin access), use them as the primary source
    if (authUsers && authUsers.length > 0) {
      console.log(`Successfully fetched ${authUsers.length} auth users`);
      
      // Auth users already have basic info, just add XP data and profile enhancements
      combinedUsers = authUsers.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id);
        const xp = xpData.find(x => x.user_id === authUser.id);
        
        return {
          ...authUser,
          display_name: profile?.display_name || authUser.display_name,
          total_xp: xp?.total_xp || 0
        };
      });
    } 
    // If we don't have auth users, use profiles as primary source
    else if (profiles && profiles.length > 0) {
      console.log(`No auth users available, using ${profiles.length} profiles as primary source`);
      
      combinedUsers = profiles.map(profile => {
        const xp = xpData.find(x => x.user_id === profile.id);
        
        return {
          id: profile.id!,
          email: profile.email || `user-${profile.id!.substring(0, 8)}@example.com`,
          created_at: profile.created_at || new Date().toISOString(),
          last_sign_in_at: profile.last_sign_in_at || null,
          display_name: profile.display_name || `User ${profile.id!.substring(0, 6)}`,
          total_xp: xp?.total_xp || 0
        };
      });
    }
    
    // If we still don't have any users, try to get current user at minimum
    if (combinedUsers.length === 0 && session?.session?.user) {
      console.log("No users found from auth or profiles, adding current user");
      
      const currentUser = session.session.user;
      const xp = xpData.find(x => x.user_id === currentUser.id);
      
      combinedUsers = [{
        id: currentUser.id,
        email: currentUser.email || `user-${currentUser.id.substring(0, 8)}@example.com`,
        created_at: currentUser.created_at || new Date().toISOString(),
        last_sign_in_at: currentUser.last_sign_in_at || null,
        display_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || "Current User",
        total_xp: xp?.total_xp || 0
      }];
    }
    
    // Final fallback - if we still have no users, create a mock sample user
    if (combinedUsers.length === 0) {
      console.log("No users found, creating mock sample user");
      combinedUsers = [createSampleUser()];
    }
    
    return { data: combinedUsers, error: null };
  } catch (err: any) {
    console.error("Error in fetchUsers:", err);
    return { 
      data: [createSampleUser()], 
      error: err.message || "Failed to fetch users"
    };
  }
}
