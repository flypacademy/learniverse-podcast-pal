
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useRecentCourses } from "@/hooks/useRecentCourses";
import { useUserXP } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";

// Import our components
import UserHeader from "@/components/home/UserHeader";
import ContinueLearning from "@/components/home/ContinueLearning";
import WeeklyStreakSection from "@/components/home/WeeklyStreakSection";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import TodaysGoalButton from "@/components/home/TodaysGoalButton";

// Mock streak data
const streakData = [
  { date: "2023-06-12", completed: true },
  { date: "2023-06-13", completed: true },
  { date: "2023-06-14", completed: true },
  { date: "2023-06-15", completed: false },
  { date: "2023-06-16", completed: false },
  { date: "2023-06-17", completed: false, partial: true },
  { date: "2023-06-18", completed: false }
];

const Index = () => {
  const { toast } = useToast();
  const { recentCourses, loading: coursesLoading } = useRecentCourses();
  const { data: legacyUserData, loading: legacyUserLoading } = useUserXP();
  const { totalXP, isLoading, refreshXPData } = useXP();
  
  // Use the new XP system data if available, otherwise fall back to legacy data
  const userName = legacyUserData?.userName || "Student";
  const displayXP = totalXP ?? legacyUserData?.totalXP ?? 0;
  
  // Refresh XP data when component mounts
  useEffect(() => {
    refreshXPData();
  }, [refreshXPData]);
  
  const handleLinkClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-5 animate-slide-up pt-3">
        {/* User Header with real XP data */}
        <UserHeader 
          userName={userName} 
          totalXP={displayXP} 
        />
        
        {/* Continue Learning with Carousel */}
        <ContinueLearning 
          courses={recentCourses}
          loading={coursesLoading}
          handleLinkClick={handleLinkClick}
        />
        
        {/* Weekly Streak */}
        <WeeklyStreakSection streak={3} days={streakData} />
        
        {/* Leaderboard */}
        <LeaderboardSection />
        
        {/* Today's Goal Button */}
        <TodaysGoalButton handleLinkClick={handleLinkClick} />
      </div>
    </Layout>
  );
};

export default Index;
