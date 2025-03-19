
import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface UserHeaderProps {
  userName: string;
  totalXP: number;
}

const UserHeader = ({ userName, totalXP }: UserHeaderProps) => {
  const { toast } = useToast();
  const [currentXP, setCurrentXP] = useState(totalXP);
  
  // Keep XP updated in real-time
  useEffect(() => {
    const fetchCurrentXP = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data, error } = await supabase
          .from('user_experience')
          .select('total_xp')
          .eq('user_id', session.user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            console.log("No XP record yet for user");
            return;
          }
          console.error("Error fetching current XP:", error);
          return;
        }
        
        if (data) {
          console.log("Updating XP display to:", data.total_xp);
          setCurrentXP(data.total_xp);
        }
      } catch (err) {
        console.error("Exception fetching XP:", err);
      }
    };
    
    fetchCurrentXP();
    
    // Set up subscription for XP updates
    const channel = supabase
      .channel('public:user_experience')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_experience' 
        }, 
        (payload) => {
          console.log("XP update received:", payload);
          fetchCurrentXP();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Update when props change
  useEffect(() => {
    setCurrentXP(totalXP);
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
        {currentXP} XP
      </div>
    </div>
  );
};

export default UserHeader;
