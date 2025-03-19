
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ListeningStats } from "@/types/xp";

export function useListeningStats(userEmail?: string) {
  const [stats, setStats] = useState<ListeningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListeningStats() {
      try {
        setLoading(true);
        
        // If email is provided, look up user by email
        let userId: string | null = null;
        
        if (userEmail) {
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', userEmail)
            .maybeSingle();
          
          if (userError) {
            console.error("Error finding user by email:", userError);
            setError("User not found");
            setLoading(false);
            return;
          }
          
          if (!userData) {
            setError(`No user found with email ${userEmail}`);
            setLoading(false);
            return;
          }
          
          userId = userData.id;
        } else {
          // Get current user session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            setError("No user is logged in");
            setLoading(false);
            return;
          }
          
          userId = session.user.id;
        }
        
        console.log("Fetching listening stats for user ID:", userId);
        
        // Query the user_progress table to get listening data
        const { data, error: progressError } = await supabase
          .from('user_progress')
          .select('last_position, updated_at, podcast_id')
          .eq('user_id', userId);
        
        if (progressError) {
          throw progressError;
        }
        
        // Calculate total seconds listened
        let totalSeconds = 0;
        let lastListenedDate: string | null = null;
        
        if (data && data.length > 0) {
          console.log("Found listening progress entries:", data.length);
          
          data.forEach(entry => {
            if (entry.last_position && typeof entry.last_position === 'number') {
              console.log(`Adding time from podcast ${entry.podcast_id}: ${entry.last_position} seconds`);
              totalSeconds += entry.last_position;
            }
            
            // Track the most recent listening activity
            if (!lastListenedDate || (entry.updated_at && entry.updated_at > lastListenedDate)) {
              lastListenedDate = entry.updated_at;
            }
          });
        } else {
          console.log("No listening progress entries found");
        }
        
        console.log("Total seconds calculated:", totalSeconds);
        
        // Convert seconds to minutes (rounded)
        const totalMinutes = Math.round(totalSeconds / 60);
        
        // Get user email if needed
        let email = userEmail;
        if (!email) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('auth.users')
              .select('email')
              .eq('id', userId)
              .maybeSingle();
              
            if (!userError && userData) {
              email = userData.email;
            }
          } catch (emailErr) {
            console.log("Could not fetch user email:", emailErr);
          }
        }
        
        setStats({
          totalMinutes,
          lastListened: lastListenedDate,
          userId,
          email: email || ""
        });
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching listening stats:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchListeningStats();
  }, [userEmail]);

  return { stats, loading, error };
}
