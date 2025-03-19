
import React from "react";
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

const defaultUserData = {
  name: "Student",
  email: "student@example.com",
  xp: 0,
  level: 1,
  streak: 4,
  totalPodcastsCompleted: 15,
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
}

const ProfileContent: React.FC<ProfileContentProps> = ({ userData }) => {
  const { analytics, loading: analyticsLoading } = useListeningAnalytics(7);
  const { stats, loading: statsLoading, error: statsError } = useListeningStats();
  const { xpData, loading: xpLoading } = useXP();
  const { toast } = useToast();
  
  // Use the XP data from the hook or fall back to the props data or finally to default
  const totalXP = xpData?.totalXP ?? userData?.totalXP ?? defaultUserData.xp;
  
  // Calculate level based on XP (500 XP per level)
  const level = Math.floor(totalXP / 500) + 1;
  const nextLevelXP = level * 500;
  const progress = ((totalXP % 500) / 500) * 100;
  
  // Format listening time
  const formatListeningTime = () => {
    // Default to 0 if stats aren't loaded yet or no minutes are recorded
    const minutes = stats?.totalMinutes ?? 0;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Log stats data for debugging
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
        // Show a toast if there are no stats after loading
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
  
  // Use real data or fallback to default for podcasts completed
  const podcastsCompleted = defaultUserData.totalPodcastsCompleted; // We don't have a way to count this yet
  
  const userCardData = {
    name: userData?.userName || defaultUserData.name,
    email: defaultUserData.email,
    xp: totalXP,
    level,
    streak: defaultUserData.streak,
    nextLevelXP,
    progress
  };
  
  const listeningTime = formatListeningTime();
  
  return (
    <div className="space-y-6 animate-slide-up">
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      
      <UserCard userData={userCardData} />
      
      <ProfileStats 
        totalPodcastsCompleted={podcastsCompleted}
        totalHoursListened={listeningTime}
      />
      
      <div className="glass-card p-4 rounded-xl">
        <StreakCalendar streak={defaultUserData.streak} days={activityDays} />
      </div>
      
      <WeeklyAnalytics analytics={analytics} loading={analyticsLoading} />
      
      <AchievementsSection achievements={achievements} />
    </div>
  );
};

export default ProfileContent;
