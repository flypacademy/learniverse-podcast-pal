
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
        
        // Get all users from the auth schema through admin functions
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, display_name, created_at');
        
        if (usersError) {
          console.error("Error fetching users:", usersError);
          throw usersError;
        }

        if (!usersData || usersData.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Extract user IDs to fetch auth info for emails and sign in dates
        const userIds = usersData.map(user => user.id);
        
        // Fetch XP data for all users
        const { data: xpData, error: xpError } = await supabase
          .from('user_experience')
          .select('user_id, total_xp')
          .in('user_id', userIds);
          
        if (xpError) {
          console.error("Error fetching user XP:", xpError);
        }
        
        // Get user email addresses from auth metadata
        // Since we can't directly query auth.users, we need to use auth API endpoints
        // For now, we'll map the profiles data and rely on session data
        
        // Combine the data
        const combinedUsers = usersData.map(user => {
          const xp = xpData?.find(x => x.user_id === user.id);
          
          return {
            id: user.id,
            email: `user-${user.id.substring(0, 8)}@example.com`, // Placeholder email since we can't access auth.users directly
            created_at: user.created_at || new Date().toISOString(),
            last_sign_in_at: null, // We don't have this information without admin access
            display_name: user.display_name,
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
