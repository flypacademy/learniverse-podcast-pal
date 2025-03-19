
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches actual users from the auth.users table via admin API
 */
export const fetchRealUsers = async () => {
  try {
    // First check if we have admin access
    const { data: hasAdminAccess } = await supabase.rpc('is_admin');
    
    if (!hasAdminAccess) {
      console.log("No admin access, can't fetch real users");
      return null;
    }
    
    // Fetch users from the auth.users table
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
    
    console.log("Auth users data:", users);
    return users.users || [];
  } catch (err) {
    console.error("Error in fetchRealUsers:", err);
    return null;
  }
};

/**
 * Fetches user profiles from the database
 */
export const fetchUserProfiles = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
  
  console.log("Profiles data:", data);
  return data || [];
};

/**
 * Fetches XP data for a list of user IDs
 */
export const fetchUserXp = async (userIds: string[]) => {
  if (!userIds.length) return [];
  
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
};
