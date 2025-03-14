
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Volume2, Award } from "lucide-react";
import Layout from "@/components/Layout";
import ProgressBar from "@/components/ProgressBar";

// Mock data
const podcasts = {
  "math-algebra-1": {
    id: "math-algebra-1",
    title: "Algebra Fundamentals",
    courseId: "math-gcse",
    courseName: "Mathematics GCSE",
    description: "Learn the basics of algebra, including variables, expressions, and equations. This episode covers essential concepts for GCSE Mathematics.",
    duration: 840,
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
  },
  "english-shakespeare-1": {
    id: "english-shakespeare-1",
    title: "Introduction to Shakespeare",
    courseId: "english-gcse",
    courseName: "English GCSE",
    description: "Discover Shakespeare's life, works, and influence. This episode provides an overview of his major plays and their themes.",
    duration: 720,
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
  }
};

const PodcastPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const podcast = id ? podcasts[id as keyof typeof podcasts] : null;
  
  useEffect(() => {
    // Simulate playback progress
    let interval: ReturnType<typeof setInterval>;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          
          // Show XP modal when reaching certain points
          if (newTime === 20) {
            setShowXPModal(true);
            setTimeout(() => setShowXPModal(false), 3000);
          }
          
          return newTime < (podcast?.duration || 0) ? newTime : prev;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, podcast?.duration]);
  
  if (!podcast) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <p>Podcast not found</p>
        </div>
      </Layout>
    );
  }
  
  const progress = (currentTime / podcast.duration) * 100;
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header with back button */}
        <div className="pt-2 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display font-semibold text-lg text-gray-900">
              Now Playing
            </h1>
            <p className="text-sm text-gray-500">{podcast.courseName}</p>
          </div>
        </div>
        
        {/* Podcast Image */}
        <div className="aspect-square max-w-xs mx-auto relative">
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg">
            {podcast.image ? (
              <img 
                src={podcast.image} 
                alt={podcast.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-math-gradient flex items-center justify-center`}>
                <Headphones className="h-20 w-20 text-white/70" />
              </div>
            )}
          </div>
          
          {/* Floating album-like circles for design */}
          <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-brand-yellow/30 backdrop-blur-lg"></div>
          <div className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-brand-purple/20 backdrop-blur-lg"></div>
        </div>
        
        {/* Podcast Info */}
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-xl text-gray-900">
            {podcast.title}
          </h2>
          <p className="text-gray-500">{podcast.courseName}</p>
        </div>
        
        {/* Player Controls */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <ProgressBar 
              value={progress} 
              size="lg" 
              color="bg-primary"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(podcast.duration)}</span>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button className="text-gray-500 hover:text-gray-700">
              <SkipBack className="h-6 w-6" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? 
                <Pause className="h-6 w-6" /> : 
                <Play className="h-6 w-6 ml-1" />
              }
            </button>
            
            <button className="text-gray-500 hover:text-gray-700">
              <SkipForward className="h-6 w-6" />
            </button>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center gap-3 max-w-xs mx-auto">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        {/* Podcast Description */}
        <div className="glass-card p-4 rounded-xl">
          <h3 className="font-medium mb-1">About this episode</h3>
          <p className="text-sm text-gray-600">
            {podcast.description}
          </p>
        </div>
      </div>
      
      {/* XP Gained Modal */}
      {showXPModal && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center animate-slide-up">
          <div className="glass-card px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">+15 XP Earned!</p>
              <p className="text-xs text-gray-500">Keep listening to earn more</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PodcastPlayer;
