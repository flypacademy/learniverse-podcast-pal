
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
 * Combines user profile and XP data
 */
const combineUserData = (profiles: any[], xpData: any[]): User[] => {
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
    // Step 1: Fetch user profiles
    const profilesData = await fetchUserProfiles();
    
    // Step 2: If no profiles exist, create a sample user
    if (profilesData.length === 0) {
      const sampleUser = await createSampleUser();
      return {
        users: [sampleUser],
        error: null
      };
    }
    
    // Step 3: Extract user IDs and fetch XP data
    const userIds = profilesData.map(profile => profile.id);
    const xpData = await fetchUserXp(userIds);
    
    // Step 4: Combine the data
    const combinedUsers = combineUserData(profilesData, xpData);
    
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
