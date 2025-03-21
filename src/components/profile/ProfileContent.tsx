
import React, { useEffect } from "react";
import { useListeningAnalytics } from "@/hooks/useListeningAnalytics";
import { useListeningStats } from "@/hooks/useListeningStats";
import ProfileHeader from "./ProfileHeader";
import UserCard from "./UserCard";
import ProfileStats from "./ProfileStats";
import WeeklyAnalytics from "./WeeklyAnalytics";
import StreakCalendar from "@/components/StreakCalendar";
import { UserXPData } from "@/hooks/useUserXP";
import { useToast } from "@/components/ui/use-toast";
import { useProfileData } from "@/hooks/useProfileData";
import { activityDays } from "@/data/activityData";
import TimeDisplay from "./TimeDisplay";

interface ProfileContentProps {
  userData?: UserXPData;
  isLoading?: boolean;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ userData, isLoading = false }) => {
  const { analytics, loading: analyticsLoading } = useListeningAnalytics(7);
  const { stats, loading: statsLoading, error: statsError } = useListeningStats();
  const { toast } = useToast();
  const { profileData, isLoading: profileLoading } = useProfileData(userData);
  
  // Handle stats loading errors
  useEffect(() => {
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
      
      if (stats.totalMinutes === 0 && !statsLoading) {
        toast({
          title: "Listening data syncing",
          description: "It may take a moment for your latest listening activity to appear.",
          duration: 5000,
        });
      }
    }
  }, [stats, statsLoading, statsError, toast]);
  
  const userCardData = {
    name: profileData.userName,
    email: profileData.email,
    xp: profileData.displayXP,
    level: profileData.level,
    streak: 4, // Hardcoded in original
    nextLevelXP: profileData.nextLevelXP,
    progress: profileData.progress
  };
  
  const showLoading = isLoading || profileLoading;
  
  return (
    <div className="space-y-6 animate-slide-up">
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      
      <UserCard userData={userCardData} loading={showLoading} />
      
      <ProfileStats 
        totalPodcastsCompleted={profileData.completedPodcasts}
        totalHoursListened={<TimeDisplay stats={stats} statsLoading={statsLoading} />}
        loading={profileData.isLoadingPodcasts}
      />
      
      <div className="glass-card p-4 rounded-xl">
        <StreakCalendar streak={4} days={activityDays} />
      </div>
      
      <WeeklyAnalytics analytics={analytics} loading={analyticsLoading} />
    </div>
  );
};

export default ProfileContent;
