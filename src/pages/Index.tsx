
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useRecentCourses } from "@/hooks/useRecentCourses";

// Import our new components
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
  const userName = "Student";
  const totalXP = 1250;
  const { toast } = useToast();
  const { recentCourses, loading } = useRecentCourses();
  
  const handleLinkClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-5 animate-slide-up pt-3">
        {/* User Header */}
        <UserHeader userName={userName} totalXP={totalXP} />
        
        {/* Continue Learning with Carousel */}
        <ContinueLearning 
          courses={recentCourses}
          loading={loading}
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
