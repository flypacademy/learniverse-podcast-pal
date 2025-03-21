
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { XPReason } from "@/types/xp";
import { toast } from "sonner";

export function useXP() {
  const [totalXP, setTotalXP] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user's XP data
  const fetchXPData = useCallback(async (force = false) => {
    // Don't fetch if we've fetched recently (within last 30 seconds) unless forced
    const now = Date.now();
    if (!force && now - lastFetch < 30000 && totalXP !== null) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set a timeout to exit loading state even if the request fails
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        if (totalXP === null) {
          setTotalXP(0); // Default to 0 if we can't load
        }
      }, 5000);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session, can't fetch XP");
        setIsLoading(false);
        if (totalXP === null) {
          setTotalXP(0);
        }
        return;
      }
      
      const userId = session.user.id;
      
      // First try the new user_xp table
      try {
        // Get total XP from user_xp table
        const { data: xpData, error: xpError } = await supabase
          .from('user_xp')
          .select('amount')
          .eq('user_id', userId);
        
        if (xpError) {
          // If this table doesn't exist, try the legacy table
          if (xpError.code === '42P01') { // PostgreSQL error code for "relation does not exist"
            console.log("user_xp table does not exist yet, checking legacy table");
            throw new Error("Table not found");
          } else {
            throw xpError;
          }
        }
        
        const total = xpData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        console.log("Found XP in user_xp table:", total);
        setTotalXP(total);
        setLastFetch(now);
      } catch (err) {
        // Try legacy user_experience table
        console.log("Trying legacy user_experience table");
        const { data: legacyXP, error: legacyError } = await supabase
          .from('user_experience')
          .select('total_xp')
          .eq('user_id', userId)
          .single();
        
        if (legacyError && legacyError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error("Error fetching legacy XP:", legacyError);
          setError(legacyError.message);
        } else if (legacyXP) {
          console.log("Found XP in legacy table:", legacyXP.total_xp);
          setTotalXP(legacyXP.total_xp);
          setLastFetch(now);
        } else {
          // If neither table has data, set to 0
          console.log("No XP data found in any table");
          setTotalXP(0);
          setLastFetch(now);
        }
      }
      
    } catch (err: any) {
      console.error("Error fetching XP data:", err);
      setError(err.message || "Failed to load XP data");
      
      // Fallback to 0 if we can't load
      if (totalXP === null) {
        setTotalXP(0);
      }
    } finally {
      setIsLoading(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [lastFetch, totalXP]);
  
  // Load XP data on mount
  useEffect(() => {
    fetchXPData();
    
    // Clean up timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
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
      
      // Handle the case where the user_xp table might not exist yet
      try {
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
          
          // Try updating legacy table as fallback
          try {
            const { data: legacyXP } = await supabase
              .from('user_experience')
              .select('total_xp, weekly_xp')
              .eq('user_id', userId)
              .single();
            
            if (legacyXP) {
              // Update existing record
              const { error: updateError } = await supabase
                .from('user_experience')
                .update({
                  total_xp: legacyXP.total_xp + amount,
                  weekly_xp: legacyXP.weekly_xp + amount,
                  last_updated: new Date().toISOString()
                })
                .eq('user_id', userId);
                
              if (!updateError) {
                // Update local state
                setTotalXP(prev => (prev || 0) + amount);
                console.log(`Added ${amount} XP for ${reason} to legacy table`);
                return true;
              }
            } else {
              // Insert new record in legacy table
              const { error: createError } = await supabase
                .from('user_experience')
                .insert([{
                  user_id: userId,
                  total_xp: amount,
                  weekly_xp: amount,
                  last_updated: new Date().toISOString(),
                  created_at: new Date().toISOString()
                }]);
                
              if (!createError) {
                // Update local state
                setTotalXP(prev => (prev || 0) + amount);
                console.log(`Added ${amount} XP for ${reason} to new legacy record`);
                return true;
              }
            }
          } catch (err) {
            console.error("Error updating legacy XP:", err);
          }
          
          return false;
        }
        
        // Update local state
        setTotalXP(prev => (prev || 0) + amount);
        
        console.log(`Awarded ${amount} XP for ${reason}`);
        return true;
      } catch (err) {
        console.error("Error awarding XP:", err);
        
        // If the error is because the table doesn't exist, just update local state
        // so the UI works even if we can't save to the database yet
        setTotalXP(prev => (prev || 0) + amount);
        return true;
      }
      
    } catch (err) {
      console.error("Error awarding XP:", err);
      return false;
    }
  };
  
  // Refresh XP data with force option
  const refreshXPData = useCallback(() => {
    return fetchXPData(true);
  }, [fetchXPData]);

  return {
    totalXP,
    isLoading,
    error,
    awardXP,
    refreshXPData
  };
}
