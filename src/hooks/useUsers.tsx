
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name?: string;
  total_xp?: number;
}

/**
 * Fetches actual users from the auth.users table via admin API
 */
const fetchRealUsers = async () => {
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
const fetchUserProfiles = async () => {
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
 * Creates a sample user profile for demonstration
 */
const createSampleUser = async () => {
  try {
    console.log("No user profiles found, trying to create a sample user...");
    
    // Generate a proper UUID 
    const sampleUserId = uuidv4();
    
    // Check if we have admin permissions by checking the user role
    const { data: roleData } = await supabase.rpc('is_admin');
    const hasAdminAccess = !!roleData;
    
    console.log("Has admin access:", hasAdminAccess);
    
    if (!hasAdminAccess) {
      console.log("No admin access, returning mock sample user");
      // If we don't have admin access, return a mock sample user
      return {
        id: sampleUserId,
        email: 'sample@example.com (mock)',
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        display_name: 'Sample User (mock)',
        total_xp: 150
      };
    }
    
    // Create a sample user profile
    const { data: sampleProfile, error: sampleProfileError } = await supabase
      .from('user_profiles')
      .insert([
        { 
          id: sampleUserId,
          display_name: 'Sample User',
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (sampleProfileError) {
      console.error("Error creating sample user:", sampleProfileError);
      throw sampleProfileError;
    }
    
    console.log("Sample user created successfully:", sampleProfile);
    
    // Create sample XP record
    const { error: sampleXpError } = await supabase
      .from('user_experience')
      .insert([
        {
          user_id: sampleUserId,
          total_xp: 150,
          weekly_xp: 50
        }
      ]);
      
    if (sampleXpError) {
      console.error("Error creating sample XP record:", sampleXpError);
    }
    
    return {
      id: sampleUserId,
      email: 'sample@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: 'Sample User',
      total_xp: 150
    };
  } catch (err) {
    console.error("Error in createSampleUser:", err);
    // Return a mock sample user as fallback
    return {
      id: uuidv4(),
      email: 'sample@example.com (fallback)',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: 'Sample User (fallback)',
      total_xp: 150
    };
  }
};

/**
 * Fetches XP data for a list of user IDs
 */
const fetchUserXp = async (userIds: string[]) => {
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

/**
 * Combines user data with profile and XP information
 */
const combineUserData = (authUsers: any[], profiles: any[], xpData: any[]): User[] => {
  return authUsers.map(user => {
    const profile = profiles.find(p => p.id === user.id);
    const xp = xpData.find(x => x.user_id === user.id);
    
    return {
      id: user.id,
      email: user.email || `user-${user.id.substring(0, 8)}@example.com`,
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: user.last_sign_in_at,
      display_name: profile?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      total_xp: xp?.total_xp || 0
    };
  });
};

/**
 * Combines profile data with XP information
 * Used as fallback when auth users cannot be fetched
 */
const combineProfileData = (profiles: any[], xpData: any[]): User[] => {
  return profiles.map(profile => {
    const xp = xpData.find(x => x.user_id === profile.id);
    
    return {
      id: profile.id,
      email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
      created_at: profile.created_at,
      last_sign_in_at: null, // We don't have this info without admin access
      display_name: profile.display_name,
      total_xp: xp?.total_xp || 0
    };
  });
};

async function loadUsers() {
  try {
    // Step 1: Try to fetch real users from auth.users
    const authUsers = await fetchRealUsers();
    
    // If we have real users from auth, use those
    if (authUsers && authUsers.length > 0) {
      console.log("Using real users from auth");
      
      // Step 2: Fetch user profiles and XP data to combine with auth users
      const profilesData = await fetchUserProfiles();
      const userIds = authUsers.map((user: any) => user.id);
      const xpData = await fetchUserXp(userIds);
      
      // Step 3: Combine all the data
      const combinedUsers = combineUserData(authUsers, profilesData, xpData);
      
      return {
        users: combinedUsers,
        error: null
      };
    }
    
    // If we don't have auth users, fall back to profiles
    const profilesData = await fetchUserProfiles();
    
    // If no profiles exist, create a sample user
    if (profilesData.length === 0) {
      const sampleUser = await createSampleUser();
      return {
        users: [sampleUser],
        error: null
      };
    }
    
    // Extract user IDs and fetch XP data
    const userIds = profilesData.map(profile => profile.id);
    const xpData = await fetchUserXp(userIds);
    
    // Combine the profile data
    const combinedUsers = combineProfileData(profilesData, xpData);
    
    return {
      users: combinedUsers,
      error: null
    };
  } catch (err: any) {
    console.error("Error in loadUsers function:", err);
    return {
      users: [],
      error: err.message
    };
  }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        const result = await loadUsers();
        
        if (result.error) {
          setError(result.error);
        } else {
          setUsers(result.users);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error in useUsers hook:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
}
