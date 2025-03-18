
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserXPData {
  totalXP: number;
  weeklyXP: number;
  userName: string;
}

export function useUserXP() {
  const [data, setData] = useState<UserXPData>({
    totalXP: 0,
    weeklyXP: 0,
    userName: 'Student'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserXP() {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Fetch user XP data
        const { data: xpData, error: xpError } = await supabase
          .from('user_experience')
          .select('total_xp, weekly_xp')
          .eq('user_id', userId)
          .single();
        
        if (xpError) {
          console.error('Error fetching XP data:', xpError);
          setError(xpError.message);
          setLoading(false);
          return;
        }
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', userId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching profile data:', profileError);
          setError(profileError.message);
        }
        
        // Set the data with defaults if needed
        setData({
          totalXP: xpData?.total_xp || 0,
          weeklyXP: xpData?.weekly_xp || 0,
          userName: profileData?.display_name || 'Student'
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Exception in useUserXP:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchUserXP();
  }, []);
  
  return { data, loading, error };
}
