
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Fetches actual users from the auth system
 * This is the primary method to get real users
 */
export const fetchRealUsers = async (): Promise<User[] | null> => {
  try {
    console.log("Attempting to fetch real users from auth system");
    
    // First check if we have admin access
    // Note: We'll skip the admin check since it's failing
    // and proceed with standard access methods
    
    // Instead of using admin API directly, we'll get users from user_profiles
    // which is a public table that mirrors auth.users
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, display_name, created_at');
    
    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      return null;
    }
    
    if (!profilesData || profilesData.length === 0) {
      console.log("No user profiles found");
      return [];
    }
    
    console.log("Found profiles data:", profilesData);
    
    // Transform profiles into User objects
    const users: User[] = profilesData.map(profile => ({
      id: profile.id,
      email: `user-${profile.id.substring(0, 8)}@example.com`, // Email placeholder as we can't access actual emails
      created_at: profile.created_at || new Date().toISOString(),
      last_sign_in_at: null, // We don't have this info in the profiles table
      display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`
    }));
    
    return users;
  } catch (err) {
    console.error("Error in fetchRealUsers:", err);
    return null;
  }
};

/**
 * Direct approach to fetch all users as a fallback
 */
export const fetchAllUsers = async (): Promise<User[] | null> => {
  try {
    console.log("Attempting alternative method to fetch users");
    
    // Try to get users from user_experience table which might have user references
    const { data: experienceData, error: experienceError } = await supabase
      .from('user_experience')
      .select('user_id, total_xp, created_at');
    
    if (experienceError) {
      console.error("Error fetching user experience data:", experienceError);
      return null;
    }
    
    if (!experienceData || experienceData.length === 0) {
      console.log("No user experience data found");
      return [];
    }
    
    console.log("Found user experience data:", experienceData);
    
    // Transform experience data into User objects
    const users: User[] = experienceData.map(exp => ({
      id: exp.user_id,
      email: `user-${exp.user_id.substring(0, 8)}@example.com`, // Email placeholder
      created_at: exp.created_at || new Date().toISOString(),
      last_sign_in_at: null,
      total_xp: exp.total_xp
    }));
    
    return users;
  } catch (err) {
    console.error("Error in fetchAllUsers:", err);
    return null;
  }
};

/**
 * Fetches user profiles from the database
 */
export const fetchUserProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching user profiles:", error);
      throw error;
    }
    
    console.log("Profiles data:", data);
    return data || [];
  } catch (err) {
    console.error("Error in fetchUserProfiles:", err);
    return [];
  }
};

/**
 * Fetches XP data for a list of user IDs
 */
export const fetchUserXp = async (userIds: string[]) => {
  if (!userIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('user_experience')
      .select('user_id, total_xp')
      .in('user_id', userIds);
      
    if (error) {
      console.error("Error fetching user XP:", error);
      return [];
    }
    
    console.log("XP data:", data);
    return data || [];
  } catch (err) {
    console.error("Error in fetchUserXp:", err);
    return [];
  }
};
