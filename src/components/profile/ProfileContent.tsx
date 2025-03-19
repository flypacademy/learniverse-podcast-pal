import React from "react";
import { useListeningAnalytics } from "@/hooks/useListeningAnalytics";
import ProfileHeader from "./ProfileHeader";
import UserCard from "./UserCard";
import ProfileStats from "./ProfileStats";
import WeeklyAnalytics from "./WeeklyAnalytics";
import StreakCalendar from "@/components/StreakCalendar";
import AchievementsSection from "./AchievementsSection";
import { Award, BookOpen, Calendar, Clock, Headphones } from "lucide-react";
import { UserXPData } from "@/hooks/useUserXP";

const defaultUserData = {
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

interface ProfileContentProps {
  userData?: UserXPData;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ userData }) => {
  const { analytics, loading } = useListeningAnalytics(7);
  
  const totalXP = userData?.totalXP || defaultUserData.xp;
  const level = Math.floor(totalXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = ((totalXP % 500) / 500) * 100;
  
  const userCardData = {
    name: userData?.userName || defaultUserData.name,
    email: defaultUserData.email,
    xp: totalXP,
    level,
    streak: defaultUserData.streak,
    nextLevelXP,
    progress
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      
      <UserCard userData={userCardData} />
      
      <ProfileStats 
        totalPodcastsCompleted={defaultUserData.totalPodcastsCompleted}
        totalHoursListened={defaultUserData.totalHoursListened}
        totalXP={totalXP}
      />
      
      <div className="glass-card p-4 rounded-xl">
        <StreakCalendar streak={defaultUserData.streak} days={activityDays} />
      </div>
      
      <WeeklyAnalytics analytics={analytics} loading={loading} />
      
      <AchievementsSection achievements={achievements} />
    </div>
  );
};

export default ProfileContent;
