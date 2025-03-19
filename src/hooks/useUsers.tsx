
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name?: string;
  total_xp?: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Fetch user profiles directly
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*');
        
        if (profilesError) {
          console.error("Error fetching user profiles:", profilesError);
          throw profilesError;
        }

        console.log("Profiles data:", profilesData);
        
        if (!profilesData || profilesData.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Extract user IDs to fetch XP data
        const userIds = profilesData.map(profile => profile.id);
        
        // Fetch XP data for all users
        const { data: xpData, error: xpError } = await supabase
          .from('user_experience')
          .select('user_id, total_xp')
          .in('user_id', userIds);
          
        if (xpError) {
          console.error("Error fetching user XP:", xpError);
        }
        
        console.log("XP data:", xpData);
        
        // Combine the data
        const combinedUsers = profilesData.map(profile => {
          const xp = xpData?.find(x => x.user_id === profile.id);
          
          return {
            id: profile.id,
            email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
            created_at: profile.created_at,
            last_sign_in_at: null, // We don't have this info without admin access
            display_name: profile.display_name,
            total_xp: xp?.total_xp || 0
          };
        });
        
        setUsers(combinedUsers);
        setError(null);
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
