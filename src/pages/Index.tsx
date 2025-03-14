
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Trophy, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import PodcastCard from "@/components/PodcastCard";

// Mock data
const featuredCourses = [
  {
    id: "math-gcse",
    title: "Mathematics GCSE",
    subject: "math" as const,
    totalPodcasts: 12,
    completedPodcasts: 5,
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
  },
  {
    id: "english-gcse",
    title: "English GCSE",
    subject: "english" as const,
    totalPodcasts: 10,
    completedPodcasts: 2,
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
  }
];

const recentPodcasts = [
  {
    id: "math-algebra-1",
    title: "Algebra Fundamentals",
    courseId: "math-gcse",
    courseName: "Mathematics GCSE",
    duration: 840,
    progress: 65,
    completed: false,
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
  },
  {
    id: "english-shakespeare-1",
    title: "Introduction to Shakespeare",
    courseId: "english-gcse",
    courseName: "English GCSE",
    duration: 720,
    progress: 0,
    completed: false,
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
  }
];

const Index = () => {
  const userName = "Student";
  const totalXP = 1250;
  const currentLevel = 5;
  
  return (
    <Layout>
      <div className="space-y-8 pb-4 animate-slide-up">
        {/* Header */}
        <div className="pt-4 flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              Hello, {userName}
            </h1>
            <p className="text-gray-500">Ready to learn today?</p>
          </div>
          <div className="flex items-center bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full text-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            {totalXP} XP
          </div>
        </div>
        
        {/* Continue Learning */}
        <div className="space-y-3">
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
          
          <div className="grid grid-cols-2 gap-4">
            {featuredCourses.map((course) => (
              <CourseCard 
                key={course.id}
                {...course}
              />
            ))}
          </div>
        </div>
        
        {/* Latest Podcasts */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-xl text-gray-900">
              Latest Podcasts
            </h2>
            <Link 
              to="/library" 
              className="text-primary flex items-center text-sm font-medium"
            >
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentPodcasts.map((podcast) => (
              <PodcastCard 
                key={podcast.id}
                {...podcast}
              />
            ))}
          </div>
        </div>
        
        {/* Achievements Preview */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-semibold text-lg text-gray-900">
              Your Achievements
            </h2>
            <Link 
              to="/profile" 
              className="text-primary flex items-center text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="flex items-center">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex-shrink-0">
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <Trophy className="h-7 w-7 text-brand-purple" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="font-medium">Level {currentLevel} Scholar</h3>
              <p className="text-sm text-gray-500">
                You've reached level {currentLevel}! Keep learning to unlock more achievements.
              </p>
              <div className="mt-1.5 progress-bar h-1.5">
                <div 
                  className="progress-value bg-gradient-to-r from-brand-purple to-brand-blue"
                  style={{ width: "65%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
