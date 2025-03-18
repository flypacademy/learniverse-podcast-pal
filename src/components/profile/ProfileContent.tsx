
import React from "react";
import { useListeningAnalytics } from "@/hooks/useListeningAnalytics";
import ProfileHeader from "./ProfileHeader";
import UserCard from "./UserCard";
import ProfileStats from "./ProfileStats";
import WeeklyAnalytics from "./WeeklyAnalytics";
import StreakCalendar from "@/components/StreakCalendar";
import AchievementsSection from "./AchievementsSection";
import { Award, BookOpen, Calendar, Clock, Headphones } from "lucide-react";

// Mock data
const userData = {
  name: "Student",
  email: "student@example.com",
  xp: 1250,
  level: 5,
  streak: 4,
  totalPodcastsCompleted: 15,
  totalHoursListened: 8.5,
  nextLevelXP: 1500,
  progress: (1250 / 1500) * 100
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

const ProfileContent: React.FC = () => {
  // Fetch real listening analytics data
  const { analytics, loading } = useListeningAnalytics(7);
  
  return (
    <div className="space-y-6 animate-slide-up">
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      
      {/* User Profile & Level */}
      <UserCard userData={userData} />
      
      {/* Stats */}
      <ProfileStats 
        totalPodcastsCompleted={userData.totalPodcastsCompleted}
        totalHoursListened={userData.totalHoursListened}
      />
      
      {/* Weekly Streak */}
      <div className="glass-card p-4 rounded-xl">
        <StreakCalendar streak={userData.streak} days={activityDays} />
      </div>
      
      {/* Learning Analytics */}
      <WeeklyAnalytics analytics={analytics} loading={loading} />
      
      {/* Achievements */}
      <AchievementsSection achievements={achievements} />
    </div>
  );
};

export default ProfileContent;
