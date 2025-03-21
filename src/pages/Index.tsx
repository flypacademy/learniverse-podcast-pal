
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import UserHeader from "@/components/home/UserHeader";
import ContinueLearning from "@/components/home/ContinueLearning";
import WeeklyStreakSection from "@/components/home/WeeklyStreakSection";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import { useXP } from "@/hooks/useXP";
import { useUserXP } from "@/hooks/useUserXP";
import { useRecentCourses } from "@/hooks/useRecentCourses";
import OnboardingCheck from "@/components/OnboardingCheck";
import TodaysGoalButton from "@/components/home/TodaysGoalButton";
import { fetchUserActivity, calculateStreak } from "@/utils/streakUtils";

const Home = () => {
  const { data: userData, loading: userLoading } = useUserXP();
  const { totalXP, refreshXPData, isLoading: xpLoading } = useXP();
  const { courses: recentCourses, loading: coursesLoading } = useRecentCourses();
  const [activityDays, setActivityDays] = useState<{ date: string; completed: boolean; partial?: boolean }[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isLoadingStreak, setIsLoadingStreak] = useState<boolean>(true);
  
  // Load streak data
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
  
  // Refresh XP data when component mounts
  useEffect(() => {
    refreshXPData();
  }, [refreshXPData]);
  
  // Show skeleton state while loading
  if (userLoading || xpLoading) {
    // We can still show the UI with loading states
  }
  
  // Show the primary XP (from the new system) or fallback to legacy
  const xp = totalXP !== null ? totalXP : userData?.totalXP || 0;
  
  // Continue with the rest of the component
  return (
    <Layout>
      <OnboardingCheck />
      
      <div className="space-y-6 animate-slide-up">
        <UserHeader 
          name={userData?.userName || "Student"} 
          xp={xp}
          loading={userLoading || xpLoading} 
        />
        
        <TodaysGoalButton />
        
        <ContinueLearning 
          courses={recentCourses} 
          loading={coursesLoading}
        />
        
        <WeeklyStreakSection 
          streak={currentStreak} 
          days={activityDays}
          loading={isLoadingStreak}
        />
        
        <LeaderboardSection />
      </div>
    </Layout>
  );
};

export default Home;
