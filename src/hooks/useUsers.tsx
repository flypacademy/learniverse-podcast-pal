
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
        
        // Fetch user data from auth.users using RPC function
        const { data: authUsers, error: authError } = await supabase
          .from('auth.users')
          .select('id, email, created_at, last_sign_in_at');
        
        if (authError) {
          console.error("Error fetching auth users:", authError);
          throw authError;
        }
        
        // Fetch profile data for all users
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, display_name');
          
        if (profileError) {
          console.error("Error fetching user profiles:", profileError);
        }
        
        // Fetch XP data for all users
        const { data: xpData, error: xpError } = await supabase
          .from('user_experience')
          .select('user_id, total_xp');
          
        if (xpError) {
          console.error("Error fetching user XP:", xpError);
        }
        
        // Combine the data
        const combinedUsers = authUsers?.map(user => {
          const profile = profileData?.find(p => p.id === user.id);
          const xp = xpData?.find(x => x.user_id === user.id);
          
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            display_name: profile?.display_name,
            total_xp: xp?.total_xp || 0
          };
        }) || [];
        
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
