
import { User } from "@/types/user";
import { fetchAuthUsers } from "./user/fetchAuthUsers";
import { fetchProfiles } from "./user/fetchProfiles";
import { fetchUserXp } from "./user/fetchUserXp";
import { createSampleUser } from "./user/createSampleUser";

/**
 * Fetches users from Supabase
 * Returns both auth users and profile data when available
 */
export async function fetchUsers() {
  try {
    console.log("Starting to fetch users from Supabase...");
    
    // First try to get users directly from auth.users 
    // This requires service_role key which we likely don't have
    let authUsers = await fetchAuthUsers();
    const profiles = await fetchProfiles();
    const xpData = await fetchUserXp();
    
    let combinedUsers: User[] = [];
    
    // If we have auth users, use them as the primary source
    if (authUsers && authUsers.length > 0) {
      console.log(`Successfully fetched ${authUsers.length} auth users`);
      
      // Combine with profiles and XP data
      combinedUsers = authUsers.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id);
        const xp = xpData.find(x => x.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          display_name: profile?.display_name || authUser.email?.split('@')[0] || "Unknown",
          total_xp: xp?.total_xp || 0
        };
      });
    } 
    // If we couldn't get auth users, use profiles as the primary source
    else if (profiles && profiles.length > 0) {
      console.log(`No auth users available, using ${profiles.length} profiles as primary source`);
      
      combinedUsers = profiles.map(profile => {
        const xp = xpData.find(x => x.user_id === profile.id);
        
        return {
          id: profile.id,
          email: `user-${profile.id.substring(0, 8)}@example.com`, // We don't have real emails from profiles
          created_at: profile.created_at,
          last_sign_in_at: null, // We don't have this from profiles
          display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`,
          total_xp: xp?.total_xp || 0
        };
      });
    }
    
    // If we still don't have any users, create a mock user as fallback
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
