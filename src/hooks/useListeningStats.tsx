
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
          console.log("Looking up user by email:", userEmail);
          
          // Use correct method to find user by email
          const { data: users, error: userError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', userEmail)
            .maybeSingle();
          
          if (userError) {
            console.error("Error finding user by email:", userError);
            setError("User not found");
            setLoading(false);
            return;
          }
          
          if (!users) {
            console.log("No user found with email:", userEmail);
            
            // Try alternative lookup using RPC if available
            try {
              const { data: emailData, error: emailError } = await supabase
                .rpc('get_user_emails');
                
              if (!emailError && emailData) {
                const userMatch = emailData.find((u: any) => u.email === userEmail);
                if (userMatch) {
                  userId = userMatch.id;
                  console.log("Found user via RPC:", userId);
                }
              }
            } catch (rpcErr) {
              console.log("RPC lookup failed:", rpcErr);
            }
            
            if (!userId) {
              setError(`No user found with email ${userEmail}`);
              setLoading(false);
              return;
            }
          } else {
            userId = users.id;
            console.log("Found user with ID:", userId);
          }
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
        
        // Make sure we don't floor the minutes - we just need to have them
        const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
        
        console.log("Total minutes calculated:", totalMinutes);
        
        // Get user email if needed
        let email = userEmail;
        if (!email && userId) {
          try {
            // Try to get email via RPC if available
            const { data: emailData, error: emailError } = await supabase
              .rpc('get_user_emails_for_ids', {
                user_ids: [userId]
              });
            
            if (!emailError && emailData && emailData.length > 0) {
              email = emailData[0].email;
            } else {
              // Fallback to current user's email
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                email = user.email;
              }
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
