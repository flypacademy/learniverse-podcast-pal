
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";
import { toast } from "sonner";

export function useXP() {
  const [totalXP, setTotalXP] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's XP data
  const fetchXPData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session, can't fetch XP");
        setIsLoading(false);
        return;
      }
      
      const userId = session.user.id;
      
      // Get total XP
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('amount')
        .eq('user_id', userId);
      
      if (xpError) {
        throw xpError;
      }
      
      const total = xpData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      setTotalXP(total);
      
    } catch (err: any) {
      console.error("Error fetching XP data:", err);
      setError(err.message || "Failed to load XP data");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load XP data on mount
  useEffect(() => {
    fetchXPData();
  }, [fetchXPData]);
  
  // Award XP to the user
  const awardXP = async (amount: number, reason: XPReason): Promise<boolean> => {
    if (!amount || amount <= 0) return false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session, can't award XP");
        return false;
      }
      
      const userId = session.user.id;
      
      // Insert XP record
      const { error: insertError } = await supabase
        .from('user_xp')
        .insert([
          {
            user_id: userId,
            amount: amount,
            reason: reason,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error("Error awarding XP:", insertError);
        return false;
      }
      
      // Update local state
      setTotalXP(prev => prev + amount);
      
      console.log(`Awarded ${amount} XP for ${reason}`);
      return true;
      
    } catch (err) {
      console.error("Error awarding XP:", err);
      return false;
    }
  };
  
  // Refresh XP data
  const refreshXPData = useCallback(async () => {
    await fetchXPData();
  }, [fetchXPData]);

  return {
    totalXP,
    isLoading,
    error,
    awardXP,
    refreshXPData
  };
}
