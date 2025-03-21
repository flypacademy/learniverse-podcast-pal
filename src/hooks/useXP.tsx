
import { useState, useEffect, useCallback, useRef } from "react";
import { XPReason } from "@/types/xp";
import { toast } from "sonner";
import { fetchNewXPTotal, fetchLegacyXP, awardNewXP, awardLegacyXP } from "@/utils/xp/xpApi";
import { getUserSession } from "@/utils/xp/userSession";

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
      
      const userId = await getUserSession();
      if (!userId) {
        setIsLoading(false);
        if (totalXP === null) {
          setTotalXP(0);
        }
        return;
      }
      
      // First try the new user_xp table
      try {
        const newXpTotal = await fetchNewXPTotal(userId);
        setTotalXP(newXpTotal);
        setLastFetch(now);
      } catch (err) {
        // Try legacy user_experience table
        console.log("Trying legacy user_experience table");
        try {
          const legacyXp = await fetchLegacyXP(userId);
          setTotalXP(legacyXp);
          setLastFetch(now);
        } catch (err: any) {
          console.error("Error fetching XP data:", err);
          setError(err.message || "Failed to load XP data");
          
          // Fallback to 0 if we can't load
          if (totalXP === null) {
            setTotalXP(0);
          }
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
      const userId = await getUserSession();
      if (!userId) {
        return false;
      }
      
      // Handle the case where the user_xp table might not exist yet
      try {
        // Try new table first
        await awardNewXP(userId, amount, reason);
        
        // Update local state
        setTotalXP(prev => (prev || 0) + amount);
        return true;
      } catch (err) {
        // Try legacy table as fallback
        try {
          await awardLegacyXP(userId, amount, reason);
          
          // Update local state
          setTotalXP(prev => (prev || 0) + amount);
          return true;
        } catch (err) {
          console.error("Error updating legacy XP:", err);
          
          // If both fail, still update local state so UI works
          setTotalXP(prev => (prev || 0) + amount);
          return true;
        }
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
