
import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface UserHeaderProps {
  userName: string;
  totalXP: number;
}

const UserHeader = ({ userName, totalXP }: UserHeaderProps) => {
  const { toast } = useToast();
  const [currentXP, setCurrentXP] = useState(totalXP);
  const [isLoading, setIsLoading] = useState(true);
  
  // Keep XP updated in real-time
  useEffect(() => {
    const fetchCurrentXP = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("No active session, can't fetch XP");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching current XP for user:", session.user.id);
        
        const { data, error } = await supabase
          .from('user_experience')
          .select('total_xp')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No XP record yet for user");
            setCurrentXP(0);
            setIsLoading(false);
            return;
          }
          console.error("Error fetching current XP:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          console.log("Updating XP display to:", data.total_xp);
          setCurrentXP(data.total_xp);
        } else {
          console.log("No XP data found, setting to 0");
          setCurrentXP(0);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Exception fetching XP:", err);
        setIsLoading(false);
      }
    };
    
    fetchCurrentXP();
    
    // Enable real-time subscription for XP updates
    const setupRealtimeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // First make sure the table is set up for realtime
      try {
        await supabase.rpc('supabase_realtime.enable_subscription', {
          table_name: 'user_experience'
        });
      } catch (err) {
        console.log("Note: Realtime setup error (may be normal):", err);
      }
      
      // Set up subscription for XP updates
      const userId = session.user.id;
      const channel = supabase
        .channel('user-xp-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_experience',
            filter: `user_id=eq.${userId}`
          }, 
          (payload) => {
            console.log("XP update received:", payload);
            if (payload.new && 'total_xp' in payload.new) {
              setCurrentXP(payload.new.total_xp as number);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup.then(fn => fn && fn());
    };
  }, []);
  
  // Update when props change
  useEffect(() => {
    if (totalXP > 0) {
      setCurrentXP(totalXP);
    }
  }, [totalXP]);
  
  // XP calculation information
  const xpInfo = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    toast({
      title: "XP System",
      description: "Earn 10 XP per minute of listening and 50 XP for completing podcasts. Maintain a daily streak for 200 XP per day!",
    });
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Hello, {userName}
        </h1>
        <p className="text-gray-500">Ready to learn today?</p>
      </div>
      <div 
        className="flex items-center bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full text-sm cursor-pointer"
        onClick={xpInfo}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        {isLoading ? "Loading..." : `${currentXP} XP`}
      </div>
    </div>
  );
};

export default UserHeader;
