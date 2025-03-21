
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useXP } from "@/hooks/useXP";
import { useToast } from "@/components/ui/use-toast";
import { UserXPData } from "@/hooks/useUserXP";

export interface ProfileData {
  displayXP: number;
  level: number;
  nextLevelXP: number;
  progress: number;
  userName: string;
  email: string;
  completedPodcasts: number;
  isLoadingPodcasts: boolean;
}

export function useProfileData(userData?: UserXPData) {
  const { totalXP, isLoading: xpLoading, refreshXPData } = useXP();
  const { toast } = useToast();
  const [stableXP, setStableXP] = useState<number>(0);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [completedPodcasts, setCompletedPodcasts] = useState<number>(0);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState<boolean>(true);
  
  // Initialize XP data
  useEffect(() => {
    if (!xpLoading && (totalXP !== null || userData?.totalXP !== undefined)) {
      const newXP = totalXP ?? userData?.totalXP ?? 0;
      setStableXP(newXP);
      setDataInitialized(true);
    }
  }, [totalXP, userData?.totalXP, xpLoading]);
  
  // Ensure XP data is refreshed
  useEffect(() => {
    if (!dataInitialized) {
      refreshXPData();
    }
  }, [dataInitialized, refreshXPData]);
  
  // Fetch completed podcasts count
  useEffect(() => {
    async function fetchCompletedPodcasts() {
      try {
        setIsLoadingPodcasts(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No user session found, can't fetch podcast completion data");
          setIsLoadingPodcasts(false);
          return;
        }
        
        const { count, error } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('completed', true);
        
        if (error) {
          console.error("Error fetching completed podcasts:", error);
          setIsLoadingPodcasts(false);
          return;
        }
        
        console.log("Completed podcasts count:", count);
        setCompletedPodcasts(count || 0);
      } catch (err) {
        console.error("Error in fetchCompletedPodcasts:", err);
      } finally {
        setIsLoadingPodcasts(false);
      }
    }
    
    fetchCompletedPodcasts();
  }, []);
  
  // Calculate level and progress
  const displayXP = stableXP;
  const level = Math.floor(displayXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = ((displayXP % 500) / 500) * 100;
  
  const profileData: ProfileData = {
    displayXP,
    level,
    nextLevelXP,
    progress,
    userName: userData?.userName || "Student",
    email: "student@example.com", // This appears hardcoded in the original
    completedPodcasts,
    isLoadingPodcasts
  };
  
  return {
    profileData,
    isLoading: xpLoading && !dataInitialized,
    refreshData: refreshXPData
  };
}
