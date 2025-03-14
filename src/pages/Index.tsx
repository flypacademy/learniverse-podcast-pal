
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, ArrowRight, Headphones } from "lucide-react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import StreakCalendar from "@/components/StreakCalendar";
import Leaderboard from "@/components/Leaderboard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useToast } from "@/components/ui/use-toast";

// Mock data
const featuredCourses = [
  {
    id: "math-gcse",
    title: "Mathematics GCSE",
    subject: "math",
    totalPodcasts: 12,
    completedPodcasts: 5,
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
    exam: "GCSE",
    board: "AQA",
    achievements: [
      { type: "streak" as const, value: 3 }
    ]
  },
  {
    id: "english-gcse",
    title: "English GCSE",
    subject: "english",
    totalPodcasts: 10,
    completedPodcasts: 2,
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png",
    exam: "GCSE",
    board: "Edexcel",
    achievements: [
      { type: "popular" as const }
    ]
  },
  {
    id: "science-gcse",
    title: "Science GCSE",
    subject: "science",
    totalPodcasts: 15,
    completedPodcasts: 0,
    image: "",
    exam: "GCSE",
    board: "OCR",
    achievements: []
  }
];

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

// Mock leaderboard data
const leaderboardData = [
  { id: "user1", name: "Alex", xp: 2430, rank: 1, change: "same" as const },
  { id: "user2", name: "Jordan", xp: 2180, rank: 2, change: "up" as const },
  { id: "user3", name: "Taylor", xp: 2050, rank: 3, change: "down" as const },
  { id: "current", name: "Student", xp: 1250, rank: 8, change: "up" as const },
  { id: "user5", name: "Casey", xp: 1100, rank: 9, change: "down" as const }
];

const Index = () => {
  const userName = "Student";
  const totalXP = 1250;
  const [activeSlide, setActiveSlide] = useState(0);
  const { toast } = useToast();
  
  // XP calculation information
  const xpInfo = () => {
    toast({
      title: "XP System",
      description: "Earn 10 XP per minute of listening and 200 XP for maintaining a daily streak. Complete 7 consecutive days for 1000 XP bonus!",
    });
  };
  
  return (
    <Layout>
      <div className="space-y-5 animate-slide-up pt-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              Hello, {userName}
            </h1>
            <p className="text-gray-500">Ready to learn today?</p>
          </div>
          <div 
            className="flex items-center bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full text-sm cursor-pointer"
            onClick={xpInfo}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {totalXP} XP
          </div>
        </div>
        
        {/* Continue Learning with Carousel */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-xl text-gray-900">
              Continue Learning
            </h2>
            <Link 
              to="/courses" 
              className="text-primary flex items-center text-sm font-medium"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <Carousel 
            className="w-full"
            onSelect={(index) => setActiveSlide(index)}
          >
            <CarouselContent>
              {featuredCourses.map((course, index) => (
                <CarouselItem key={course.id} className="md:basis-1/1">
                  <CourseCard 
                    id={course.id}
                    title={course.title}
                    subject={course.subject}
                    totalPodcasts={course.totalPodcasts}
                    completedPodcasts={course.completedPodcasts}
                    image={course.image}
                    size="large"
                    exam={course.exam}
                    board={course.board}
                    achievements={course.achievements}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-2">
              <div className="flex gap-1.5">
                {featuredCourses.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 rounded-full ${index === activeSlide ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </Carousel>
        </div>
        
        {/* Weekly Streak */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-xl text-gray-900">
              Weekly Streak
            </h2>
            <span className="text-sm text-primary font-medium">
              +200 XP per day
            </span>
          </div>
          <StreakCalendar streak={3} days={streakData} />
        </div>
        
        {/* Leaderboard - replacing Level Achievement Card */}
        <div className="glass-card p-4 rounded-xl">
          <Leaderboard 
            users={leaderboardData} 
            currentUserId="current" 
          />
        </div>
        
        {/* Today's Goal Button */}
        <Link to="/goals">
          <div className="glass-card p-4 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-primary to-blue-600 flex-shrink-0 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              
              <div className="ml-4">
                <h3 className="font-medium">Set Today's Listening Goal</h3>
                <p className="text-sm text-gray-500">
                  Choose your podcast goal for today and start earning XP
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
