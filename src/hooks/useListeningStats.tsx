
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
          // Try to find user by email
          const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
          
          if (userError) {
            console.error("Error finding user by email:", userError);
            setError("User not found");
            setLoading(false);
            return;
          }
          
          if (!userData?.user) {
            setError(`No user found with email ${userEmail}`);
            setLoading(false);
            return;
          }
          
          userId = userData.user.id;
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
          .select('*')
          .eq('user_id', userId);
        
        if (progressError) {
          console.error("Error fetching progress:", progressError);
          throw progressError;
        }
        
        console.log("Raw user_progress data:", data);
        
        // Calculate total seconds listened
        let totalSeconds = 0;
        let lastListenedDate: string | null = null;
        
        if (data && data.length > 0) {
          console.log("Found listening progress entries:", data.length);
          
          data.forEach(entry => {
            // Ensure last_position is a number and valid
            if (entry.last_position && typeof entry.last_position === 'number' && !isNaN(entry.last_position)) {
              console.log(`Adding time from podcast ${entry.podcast_id}: ${entry.last_position} seconds`);
              totalSeconds += entry.last_position;
            } else {
              console.log(`Skipping invalid position from podcast ${entry.podcast_id}:`, entry.last_position);
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
        const totalMinutes = Math.floor(totalSeconds / 60);
        
        console.log("Total minutes calculated:", totalMinutes);
        
        // Get user email if needed
        let email = userEmail;
        if (!email) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              email = user.email;
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
        
        console.log("Final stats object being set:", {
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
