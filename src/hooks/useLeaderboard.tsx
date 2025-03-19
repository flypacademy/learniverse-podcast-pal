
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
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;
      
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }
      
      // Query the tables using the established relationship
      const { data, error: fetchError } = await supabase
        .from('user_experience')
        .select(`
          user_id,
          total_xp,
          user_profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .order('total_xp', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      // If there's no data yet, use fallback data
      if (!data || data.length === 0) {
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
      const formattedData = data.map((item, index) => {
        const profile = item.user_profiles as any;
        const userId = item.user_id;
        
        // Determine rank change
        let change: "up" | "down" | "same" = "same";
        if (previousRanks[userId]) {
          if (previousRanks[userId] > index + 1) {
            change = "up"; // Rank improved (number got smaller)
          } else if (previousRanks[userId] < index + 1) {
            change = "down"; // Rank worsened (number got larger)
          }
        }
        
        return {
          id: userId,
          display_name: profile?.display_name || `User-${index + 1}`,
          total_xp: item.total_xp,
          rank: index + 1,
          avatar_url: profile?.avatar_url,
          change
        };
      });
      
      // Store current ranks for next comparison
      const newRanks: Record<string, number> = {};
      formattedData.forEach(user => {
        newRanks[user.id] = user.rank;
      });
      setPreviousRanks(newRanks);
      
      setLeaderboardData(formattedData);
      setLoading(false);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching leaderboard data:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLeaderboardData();
    
    // Refresh leaderboard every 60 seconds
    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
    }, 60000);
    
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
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { leaderboardData, currentUserId, loading, error, refetchLeaderboard: fetchLeaderboardData };
}
