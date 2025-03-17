
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface LeaderboardUser {
  id: string;
  display_name: string;
  total_xp: number;
  rank: number;
  avatar_url?: string;
  change: "up" | "down" | "same";
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboardData() {
      try {
        setLoading(true);
        
        // Get current session
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUser = sessionData.session?.user;
        
        if (currentUser) {
          setCurrentUserId(currentUser.id);
        }
        
        // Join user_experience with user_profiles to get both XP and display names
        const { data: combinedData, error: combinedError } = await supabase
          .from('user_experience')
          .select(`
            user_id,
            total_xp,
            user_profiles:user_id(
              display_name,
              avatar_url
            )
          `)
          .order('total_xp', { ascending: false });
          
        if (combinedError) {
          throw combinedError;
        }
        
        // If there's no data yet, use fallback data
        if (!combinedData || combinedData.length === 0) {
          // Use default mock data for initial state
          const mockData = [
            { id: "user1", display_name: "Alex", total_xp: 2430, rank: 1, change: "same" as const },
            { id: "user2", display_name: "Jordan", total_xp: 2180, rank: 2, change: "up" as const },
            { id: "user3", display_name: "Taylor", total_xp: 2050, rank: 3, change: "down" as const },
            { id: "current", display_name: "Student", total_xp: 1250, rank: 8, change: "up" as const },
            { id: "user5", display_name: "Casey", total_xp: 1100, rank: 9, change: "down" as const }
          ];
          
          setLeaderboardData(mockData);
          if (!currentUserId) setCurrentUserId("current");
          setLoading(false);
          return;
        }
        
        // Transform the joined data into our leaderboard format
        const formattedData = combinedData.map((item, index) => {
          return {
            id: item.user_id,
            display_name: item.user_profiles?.display_name || `User-${index + 1}`,
            total_xp: item.total_xp,
            rank: index + 1,
            avatar_url: item.user_profiles?.avatar_url,
            // Randomly assign change for now, in the future this would be based on previous rankings
            change: ["up", "down", "same"][Math.floor(Math.random() * 3)] as "up" | "down" | "same"
          };
        });
        
        setLeaderboardData(formattedData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching leaderboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchLeaderboardData();
    
    // Set up real-time subscription for leaderboard updates
    const channel = supabase
      .channel('public:user_experience')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_experience' 
        }, 
        () => {
          // Refetch data when there are changes
          fetchLeaderboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { leaderboardData, currentUserId, loading, error };
}
