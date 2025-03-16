
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import PodcastCard from "@/components/PodcastCard";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Leaderboard from "@/components/Leaderboard";
import { Bell, Search, Play, Star, Clock, Rocket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [listeningTime, setListeningTime] = useState(20);
  const [dailyGoal, setDailyGoal] = useState(20);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleTimeUpdate = (newTime: number) => {
    setListeningTime(newTime);
  };

  const handleSaveGoal = () => {
    setDailyGoal(listeningTime);
    toast({
      title: "Goal updated",
      description: `Your daily listening goal is now ${listeningTime} minutes`,
    });
  };

  return (
    <Layout>
      <div className="pb-16 pt-4 animate-slide-up space-y-6">
        {/* Greeting Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Good afternoon{user ? `, ${user.email?.split('@')[0]}` : ''}
            </h1>
            <p className="text-gray-500">Ready for today's learning?</p>
          </div>
          <button className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        {/* Today's Goal Section */}
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="h-9 w-9 rounded-full bg-brand-blue text-white flex items-center justify-center mr-3">
              <Rocket className="h-5 w-5" />
            </div>
            <h2 className="font-display text-lg font-semibold">Today's listening goal</h2>
          </div>
          
          <div className="flex items-center mt-2 gap-3">
            <Input
              type="number"
              min="5"
              max="120"
              value={listeningTime}
              onChange={(e) => handleTimeUpdate(parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <span className="text-gray-500">minutes</span>
            <Button size="sm" onClick={handleSaveGoal}>
              Set Goal
            </Button>
          </div>
          
          <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-purple"
              style={{ width: `${Math.min((10 / dailyGoal) * 100, 100)}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>10 mins completed</span>
            <span>{dailyGoal} mins goal</span>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 text-gray-900">
            Continue Learning
          </h2>
          <div className="space-y-3">
            <PodcastCard
              id="algebra-fundamentals"
              title="Algebra Fundamentals"
              courseId="math-course"
              courseName="Mathematics"
              duration={1260}
              progress={32}
              completed={false}
              achievements={[
                { type: "popular", label: "Popular" },
                { type: "new", label: "New" }
              ]}
            />
            <PodcastCard
              id="simultaneous-equations"
              title="Simultaneous Equations"
              courseId="math-course"
              courseName="Mathematics"
              duration={960}
              progress={0}
              completed={false}
              achievements={[
                { type: "recommended", label: "Recommended" }
              ]}
            />
            <PodcastCard
              id="making-inferences"
              title="Making Inferences from Text"
              courseId="english-course"
              courseName="English"
              duration={840}
              progress={75}
              completed={false}
              achievements={[]}
            />
          </div>
        </div>

        {/* Featured Courses Section */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4 text-gray-900">
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CourseCard
              id="math-course"
              title="Mathematics: Algebra & Functions"
              subject="math"
              totalPodcasts={12}
              completedPodcasts={3}
              image=""
              achievements={[
                { type: "popular" },
                { type: "recommended" }
              ]}
            />
            <CourseCard
              id="english-course"
              title="English Language: Analysis Techniques"
              subject="english"
              totalPodcasts={10}
              completedPodcasts={1}
              image=""
              achievements={[
                { type: "streak", value: 3 }
              ]}
            />
          </div>
        </div>

        {/* Leaderboard Section - with padding to prevent overlap */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold mb-4 text-gray-900">
            Leaderboard
          </h2>
          <div className="glass-card p-4 rounded-xl">
            <Leaderboard />
          </div>
        </div>
        
        {/* Bottom spacing to prevent overlap with navigation */}
        <div className="h-20"></div>
      </div>
    </Layout>
  );
};

export default Index;
