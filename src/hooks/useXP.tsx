
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { awardXP, getUserXP } from '@/utils/xpUtils';
import { useToast } from '@/components/ui/use-toast';
import { useIconToast } from '@/components/ui/custom-toast';
import { UserXP } from '@/types/xp';

export function useXP() {
  const { toast } = useToast();
  const { toast: iconToast } = useIconToast();
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
      .channel('table-db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_experience'
        }, 
        async (payload) => {
          try {
            // Only update if we have a userId and the change is for this user
            if (userId && payload.new && (payload.new as any).user_id === userId) {
              console.log('XP update received via realtime:', payload);
              
              // Fetch the latest data to ensure we have the most up-to-date values
              const freshData = await getUserXP(userId);
              setXpData(freshData);
            }
          } catch (err) {
            console.error('Error handling XP realtime update:', err);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Award XP function that uses the toast from this hook
  const awardUserXP = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!userId) {
      console.error('Cannot award XP: No authenticated user');
      return false;
    }
    
    const showToastFn = (props: { title: string; description: string }) => {
      // Use the icon toast by default for XP awards
      let icon: "award" | "star" | "trophy" | "zap" | "sparkles" = "award";
      
      // Choose different icons based on XP amount or reason
      if (reason.includes("completing a podcast")) {
        icon = "trophy";
      } else if (amount >= 100) {
        icon = "star";
      } else if (reason.includes("quiz")) {
        icon = "sparkles";
      } else if (reason.includes("streak")) {
        icon = "zap";
      }
      
      iconToast({
        title: props.title,
        description: props.description,
        icon,
        duration: 3000,
      });
    };
    
    const success = await awardXP(userId, amount, reason, showToastFn);
    
    if (success) {
      // The real-time subscription should update the state
      console.log(`Successfully awarded ${amount} XP for ${reason}`);
    }
    
    return success;
  }, [userId, iconToast]);
  
  return {
    xpData,
    loading,
    userId,
    awardXP: awardUserXP
  };
}
