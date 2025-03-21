
import React, { useEffect, useState } from "react";
import { useListeningAnalytics } from "@/hooks/useListeningAnalytics";
import { useListeningStats } from "@/hooks/useListeningStats";
import ProfileHeader from "./ProfileHeader";
import UserCard from "./UserCard";
import ProfileStats from "./ProfileStats";
import WeeklyAnalytics from "./WeeklyAnalytics";
import StreakCalendar from "@/components/StreakCalendar";
import AchievementsSection from "./AchievementsSection";
import { Award, BookOpen, Calendar, Clock, Headphones } from "lucide-react";
import { UserXPData } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { fetchUserActivity, calculateStreak } from "@/utils/streakUtils";

const defaultUserData = {
  name: "Student",
  email: "student@example.com",
  xp: 0,
  level: 1,
  streak: 0,
  totalPodcastsCompleted: 0,
  totalHoursListened: 8.5,
  nextLevelXP: 500,
  progress: 0
};

const achievements = [
  {
    id: "first-podcast",
    title: "First Listen",
    description: "Completed your first podcast",
    unlocked: true,
    icon: <Headphones className="h-6 w-6 text-white" />,
    color: "bg-math-gradient"
  },
  {
    id: "three-day-streak",
    title: "Consistent",
    description: "3 day streak",
    unlocked: true,
    icon: <Calendar className="h-6 w-6 text-white" />,
    color: "bg-english-gradient"
  },
  {
    id: "five-podcasts",
    title: "Getting Started",
    description: "Complete 5 podcasts",
    unlocked: true,
    icon: <BookOpen className="h-6 w-6 text-white" />,
    color: "bg-science-gradient"
  },
  {
    id: "complete-course",
    title: "Course Master",
    description: "Complete a full course",
    unlocked: false,
    progress: 45,
    icon: <Award className="h-6 w-6 text-white" />,
    color: "bg-history-gradient"
  },
  {
    id: "ten-hours",
    title: "Dedicated",
    description: "Listen for 10 hours",
    unlocked: false,
    progress: 85,
    icon: <Clock className="h-6 w-6 text-white" />,
    color: "bg-languages-gradient"
  }
];

const activityDays = [
  { date: "2023-06-05", completed: true },
  { date: "2023-06-06", completed: true },
  { date: "2023-06-07", completed: true },
  { date: "2023-06-08", completed: true },
  { date: "2023-06-09", completed: false, partial: true },
  { date: "2023-06-10", completed: false },
  { date: "2023-06-11", completed: false }
];

interface ProfileContentProps {
  userData?: UserXPData;
  isLoading?: boolean;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ userData, isLoading = false }) => {
  const { analytics, loading: analyticsLoading } = useListeningAnalytics(7);
  const { stats, loading: statsLoading, error: statsError } = useListeningStats();
  const { totalXP, isLoading: xpLoading, refreshXPData } = useXP();
  const { toast } = useToast();
  const [stableXP, setStableXP] = useState<number>(0);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [completedPodcasts, setCompletedPodcasts] = useState<number>(0);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState<boolean>(true);
  const [activityDays, setActivityDays] = useState<{ date: string; completed: boolean; partial?: boolean }[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isLoadingStreak, setIsLoadingStreak] = useState<boolean>(true);
  
  // Initialize XP data
  useEffect(() => {
    if (!isLoading && !xpLoading && (totalXP !== null || userData?.totalXP !== undefined)) {
      const newXP = totalXP ?? userData?.totalXP ?? 0;
      setStableXP(newXP);
      setDataInitialized(true);
    }
  }, [totalXP, userData?.totalXP, isLoading, xpLoading]);
  
  useEffect(() => {
    if (!dataInitialized) {
      refreshXPData();
    }
  }, [dataInitialized, refreshXPData]);
  
  // Fetch user activity data for streak calculation
  useEffect(() => {
    async function loadActivityData() {
      try {
        setIsLoadingStreak(true);
        const activityData = await fetchUserActivity();
        setActivityDays(activityData);
        
        const streak = calculateStreak(activityData);
        setCurrentStreak(streak);
      } catch (err) {
        console.error("Error loading streak data:", err);
      } finally {
        setIsLoadingStreak(false);
      }
    }
    
    loadActivityData();
  }, []);
  
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
  
  const displayXP = stableXP;
  
  const level = Math.floor(displayXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = ((displayXP % 500) / 500) * 100;
  
  const formatListeningTime = () => {
    const minutes = stats?.totalMinutes ?? 0;
    
    if (minutes === 0) {
      return "Just started";
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    }
    
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  };
  
  React.useEffect(() => {
    if (statsError) {
      console.error("Error loading listening stats:", statsError);
      toast({
        title: "Error loading stats",
        description: "We couldn't load your listening statistics. Please try again later.",
        variant: "destructive",
      });
    }
    
    if (stats) {
      console.log("Listening stats retrieved:", stats);
      console.log("Formatted listening time:", formatListeningTime());
      
      if (stats.totalMinutes === 0 && !statsLoading) {
        toast({
          title: "Listening data syncing",
          description: "It may take a moment for your latest listening activity to appear.",
          duration: 5000,
        });
      }
    } else if (!statsLoading) {
      console.log("No listening stats available");
    }
  }, [stats, statsLoading, statsError, toast]);
  
  const userCardData = {
    name: userData?.userName || defaultUserData.name,
    email: defaultUserData.email,
    xp: displayXP,
    level,
    streak: currentStreak,
    nextLevelXP,
    progress
  };
  
  const showLoading = isLoading || (xpLoading && !dataInitialized);
  
  const listeningTime = formatListeningTime();
  
  return (
    <div className="space-y-6 animate-slide-up">
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      
      <UserCard userData={userCardData} loading={showLoading} />
      
      <ProfileStats 
        totalPodcastsCompleted={completedPodcasts}
        totalHoursListened={listeningTime}
        loading={isLoadingPodcasts}
      />
      
      <div className="glass-card p-4 rounded-xl">
        <StreakCalendar 
          streak={currentStreak} 
          days={activityDays} 
          loading={isLoadingStreak}
        />
      </div>
      
      <WeeklyAnalytics analytics={analytics} loading={analyticsLoading} />
      
      <AchievementsSection achievements={achievements} />
    </div>
  );
};

export default ProfileContent;
