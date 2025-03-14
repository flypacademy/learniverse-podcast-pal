
import React from "react";
import { BarChart3, Award, Clock, Calendar, BookOpen, Settings } from "lucide-react";
import Layout from "@/components/Layout";
import ProgressBar from "@/components/ProgressBar";
import StreakCalendar from "@/components/StreakCalendar";
import AchievementBadge from "@/components/AchievementBadge";

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

const Profile = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="pt-4 flex justify-between items-start">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              Profile
            </h1>
            <p className="text-gray-500">Track your progress and achievements</p>
          </div>
          <button className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        {/* User Profile & Level */}
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white flex items-center justify-center font-display font-bold text-xl">
              {userData.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <h2 className="font-display font-semibold text-xl">
                {userData.name}
              </h2>
              <p className="text-gray-500 text-sm">{userData.email}</p>
              
              <div className="mt-1.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">Level {userData.level}</span>
                  <span>{userData.xp} / {userData.nextLevelXP} XP</span>
                </div>
                <ProgressBar 
                  value={userData.progress} 
                  size="md"
                  color="bg-gradient-to-r from-brand-purple to-brand-blue"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Podcasts</p>
                <p className="font-display font-semibold text-xl">
                  {userData.totalPodcastsCompleted}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours</p>
                <p className="font-display font-semibold text-xl">
                  {userData.totalHoursListened}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Weekly Streak */}
        <div className="glass-card p-4 rounded-xl">
          <StreakCalendar streak={userData.streak} days={activityDays} />
        </div>
        
        {/* Learning Analytics */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-semibold text-gray-900">Learning Analytics</h3>
            <div className="badge bg-primary/10 text-primary">
              This Week
            </div>
          </div>
          
          <div className="h-48 flex items-end justify-between px-2">
            {/* Simple bar chart representation */}
            {[30, 45, 20, 80, 60, 25, 10].map((height, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-6 bg-gradient-to-t from-primary to-brand-purple rounded-t-md"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-semibold text-xl text-gray-900">
              Achievements
            </h2>
            <div className="badge bg-primary/10 text-primary">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl">
            <div className="grid grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  {...achievement}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
