
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { awardXP, getUserXP } from '@/utils/xpUtils';
import { useToast } from '@/components/ui/use-toast';
import { UserXP } from '@/types/xp';

export function useXP() {
  const { toast } = useToast();
  const [xpData, setXpData] = useState<UserXP | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch current user and their XP data
  useEffect(() => {
    const fetchUserAndXP = async () => {
      try {
        setLoading(true);
        
        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log('No authenticated user found');
          setLoading(false);
          setUserId(null);
          setXpData(null);
          return;
        }
        
        const uid = session.user.id;
        setUserId(uid);
        
        // Get user XP data
        const data = await getUserXP(uid);
        console.log('Fetched XP data:', data);
        setXpData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error in useXP hook:', error);
        setLoading(false);
      }
    };
    
    fetchUserAndXP();
    
    // Set up real-time subscription for XP updates
    const channel = supabase
      .channel('user-xp-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_experience',
          filter: userId ? `user_id=eq.${userId}` : undefined
        }, 
        async (payload) => {
          try {
            console.log('XP update received via realtime:', payload);
            
            // When we get an update, refresh the XP data
            await refreshXPData();
          } catch (err) {
            console.error('Error handling XP realtime update:', err);
          }
        }
      )
      .subscribe();
      
    console.log('Subscribed to XP real-time updates');
    
    return () => {
      supabase.removeChannel(channel);
      console.log('Unsubscribed from XP real-time updates');
    };
  }, [userId]);
  
  // Manual refresh function that can be called after XP awards
  const refreshXPData = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('Manually refreshing XP data');
      const data = await getUserXP(userId);
      console.log('Refreshed XP data:', data);
      setXpData(data);
    } catch (error) {
      console.error('Error refreshing XP data:', error);
    }
  }, [userId]);
  
  // Award XP function that uses the toast from this hook
  const awardUserXP = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!userId) {
      console.error('Cannot award XP: No authenticated user');
      return false;
    }
    
    const showToastFn = (props: { title: string; description: string }) => {
      toast(props);
    };
    
    const success = await awardXP(userId, amount, reason, showToastFn);
    
    if (success) {
      console.log(`Successfully awarded ${amount} XP for ${reason}`);
      
      // Immediately refresh XP data after awarding
      await refreshXPData();
    }
    
    return success;
  }, [userId, toast, refreshXPData]);
  
  return {
    xpData,
    loading,
    userId,
    awardXP: awardUserXP,
    refreshXPData
  };
}
