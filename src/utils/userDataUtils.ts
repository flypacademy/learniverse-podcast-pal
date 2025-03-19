
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Fetches actual users from the auth system
 * This is the primary method to get real users
 */
export const fetchRealUsers = async (): Promise<User[] | null> => {
  try {
    console.log("Attempting to fetch real users from auth system");
    
    // Get session to verify we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.log("No authenticated session found");
      return null;
    }
    
    // First check if we have admin access - this is required to fetch auth users
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    
    if (adminError) {
      console.error("Error checking admin status:", adminError);
      return null;
    }
    
    console.log("Admin check result:", isAdmin);
    
    if (!isAdmin) {
      console.log("User doesn't have admin access to fetch all users");
      return null;
    }
    
    // Fetch all users using the admin API
    const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching auth users:", usersError);
      return null;
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log("No auth users found");
      return [];
    }
    
    console.log(`Found ${authUsers.users.length} auth users`);
    
    // Transform auth users to our User model
    const users: User[] = authUsers.users.map(user => ({
      id: user.id,
      email: user.email || `user-${user.id.substring(0, 8)}@example.com`,
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: user.last_sign_in_at,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Unknown'
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
    
    // Try to get user IDs from profiles table which anyone can access
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
    
    console.log(`Found ${profilesData.length} user profiles`);
    
    // Get the matching email addresses if possible
    const users: User[] = await Promise.all(
      profilesData.map(async (profile) => {
        // Try to get the user's email from auth if we have permission
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        return {
          id: profile.id,
          email: userData?.user?.email || `user-${profile.id.substring(0, 8)}@example.com`,
          created_at: profile.created_at || new Date().toISOString(),
          last_sign_in_at: userData?.user?.last_sign_in_at || null,
          display_name: profile.display_name || `User ${profile.id.substring(0, 6)}`
        };
      })
    );
    
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
 * Directly fetch auth users - new method to access users directly
 */
export const fetchAuthUsers = async (): Promise<User[] | null> => {
  try {
    console.log("Fetching auth users directly");
    
    // Try to access the auth users directly
    const { data, error } = await supabase.from('auth.users').select('*');
    
    if (error) {
      // This approach likely won't work due to RLS restrictions
      console.error("Cannot directly query auth.users:", error);
      
      // Use the admin API instead
      const { data: adminData, error: adminError } = await supabase.auth.admin.listUsers();
      
      if (adminError) {
        console.error("Admin API also failed:", adminError);
        return null;
      }
      
      console.log("Successfully fetched users with admin API");
      return adminData.users.map(user => ({
        id: user.id,
        email: user.email || 'Unknown',
        created_at: user.created_at || new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Unknown'
      }));
    }
    
    return data.map(user => ({
      id: user.id,
      email: user.email || 'Unknown',
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: user.last_sign_in_at,
      display_name: user.email?.split('@')[0] || 'Unknown'
    }));
  } catch (err) {
    console.error("Error in fetchAuthUsers:", err);
    return null;
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
