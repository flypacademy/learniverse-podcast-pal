
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches actual users from the auth.users table via admin API
 */
export const fetchRealUsers = async () => {
  try {
    // First check if we have admin access
    const { data: hasAdminAccess, error: adminCheckError } = await supabase.rpc('is_admin');
    
    if (adminCheckError) {
      console.error("Error checking admin status:", adminCheckError);
      return null;
    }
    
    if (!hasAdminAccess) {
      console.log("No admin access, can't fetch real users");
      return null;
    }
    
    // Fetch users from the auth.users table
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
    
    console.log("Auth users data:", data);
    return data.users || [];
  } catch (err) {
    console.error("Error in fetchRealUsers:", err);
    return null;
  }
};

/**
 * Direct approach to fetch all users when auth API fails
 * This acts as a fallback to get at least basic user data
 */
export const fetchAllUsers = async (): Promise<User[] | null> => {
  try {
    console.log("Attempting to fetch all users directly from auth.users");
    
    // Try to query auth.users directly (requires proper permissions)
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at, last_sign_in_at');
    
    if (error) {
      console.error("Error directly fetching auth users:", error);
      return null;
    }
    
    console.log("Direct auth query data:", data);
    
    // Transform the data to match the User type
    const users: User[] = (data || []).map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
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
