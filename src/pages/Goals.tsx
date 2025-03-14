import React, { useState, useEffect } from "react";
import { Clock, BookOpen, Play, Calendar, Sparkles, SkipForward } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PodcastCard from "@/components/PodcastCard";
import { useToast } from "@/components/ui/use-toast";

// Mock courses data
const courses = [
  { id: "math-gcse", name: "Mathematics", exam: "GCSE", board: "AQA" },
  { id: "english-gcse", name: "English", exam: "GCSE", board: "Edexcel" },
  { id: "science-gcse", name: "Science", exam: "GCSE", board: "OCR" },
  { id: "history-gcse", name: "History", exam: "A-Level", board: "AQA" },
  { id: "french-gcse", name: "French", exam: "IGCSE", board: "CIE" },
];

// Mock podcasts data
const podcasts = [
  {
    id: "podcast-1",
    title: "Algebra Fundamentals",
    courseId: "math-gcse",
    courseName: "Mathematics GCSE",
    duration: 540, // 9 minutes
    progress: 0,
    completed: false,
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
  },
  {
    id: "podcast-2",
    title: "Shakespeare Analysis",
    courseId: "english-gcse",
    courseName: "English GCSE",
    duration: 720, // 12 minutes
    progress: 0,
    completed: false,
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
  },
  {
    id: "podcast-3",
    title: "Chemical Reactions",
    courseId: "science-gcse",
    courseName: "Science GCSE",
    duration: 600, // 10 minutes
    progress: 0,
    completed: false,
    image: ""
  },
  {
    id: "podcast-4",
    title: "World War II Overview",
    courseId: "history-gcse",
    courseName: "History A-Level",
    duration: 840, // 14 minutes
    progress: 0,
    completed: false,
    image: ""
  },
  {
    id: "podcast-5",
    title: "French Conversation",
    courseId: "french-gcse",
    courseName: "French IGCSE",
    duration: 480, // 8 minutes
    progress: 0,
    completed: false,
    image: ""
  }
];

interface GoalSettings {
  timeGoal: number; // in minutes
  selectedCourses: string[];
}

interface CurrentSession {
  isActive: boolean;
  podcastsQueue: any[];
  currentPodcastIndex: number;
  timeRemaining: number; // in seconds
  earnedXP: number;
}

const Goals = () => {
  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    timeGoal: 20, // default 20 minutes
    selectedCourses: [],
  });
  
  const [currentSession, setCurrentSession] = useState<CurrentSession>({
    isActive: false,
    podcastsQueue: [],
    currentPodcastIndex: 0,
    timeRemaining: 0,
    earnedXP: 0
  });
  
  const [recommendedPodcasts, setRecommendedPodcasts] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Update recommended podcasts when goal settings change
  useEffect(() => {
    if (goalSettings.selectedCourses.length === 0) {
      // If no courses selected, show all podcasts sorted by duration
      setRecommendedPodcasts([...podcasts].sort((a, b) => a.duration - b.duration));
      return;
    }
    
    // Filter podcasts from selected courses
    const filtered = podcasts.filter(podcast => 
      goalSettings.selectedCourses.includes(podcast.courseId)
    );
    
    setRecommendedPodcasts(filtered);
  }, [goalSettings]);
  
  const handleTimeGoalChange = (value: number[]) => {
    setGoalSettings(prev => ({ ...prev, timeGoal: value[0] }));
  };
  
  const toggleCourseSelection = (courseId: string) => {
    setGoalSettings(prev => {
      const isSelected = prev.selectedCourses.includes(courseId);
      if (isSelected) {
        return {
          ...prev,
          selectedCourses: prev.selectedCourses.filter(id => id !== courseId)
        };
      } else {
        return {
          ...prev,
          selectedCourses: [...prev.selectedCourses, courseId]
        };
      }
    });
  };
  
  const startGoalSession = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    if (recommendedPodcasts.length === 0) {
      toast({
        title: "No podcasts available",
        description: "Please select at least one course with available podcasts",
        variant: "destructive"
      });
      return;
    }
    
    // Create a queue of podcasts that fit within the time goal
    let queue = [];
    let totalDuration = 0;
    
    for (const podcast of recommendedPodcasts) {
      if (totalDuration < goalSettings.timeGoal * 60) {
        queue.push(podcast);
        totalDuration += podcast.duration;
      }
    }
    
    setCurrentSession({
      isActive: true,
      podcastsQueue: queue,
      currentPodcastIndex: 0,
      timeRemaining: goalSettings.timeGoal * 60, // convert to seconds
      earnedXP: 0
    });
    
    toast({
      title: "Goal session started!",
      description: `${queue.length} podcasts queued for ${goalSettings.timeGoal} minutes`,
    });
  };
  
  const completeGoalSession = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    const minutesListened = Math.ceil((goalSettings.timeGoal * 60 - currentSession.timeRemaining) / 60);
    const earnedXP = minutesListened * 10; // 10 XP per minute listened
    
    toast({
      title: "Goal completed!",
      description: `You earned ${earnedXP} XP for listening to ${minutesListened} minutes of content.`,
    });
    
    setCurrentSession({
      isActive: false,
      podcastsQueue: [],
      currentPodcastIndex: 0,
      timeRemaining: 0,
      earnedXP: 0
    });
  };
  
  const skipCurrentPodcast = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (currentSession.currentPodcastIndex < currentSession.podcastsQueue.length - 1) {
      setCurrentSession(prev => ({
        ...prev,
        currentPodcastIndex: prev.currentPodcastIndex + 1
      }));
      
      toast({
        title: "Skipped podcast",
        description: "Playing the next podcast in your queue",
      });
    } else {
      completeGoalSession();
    }
  };
  
  // Simulate time passing (in a real app, this would be based on actual listening time)
  useEffect(() => {
    if (!currentSession.isActive) return;
    
    const timer = setInterval(() => {
      setCurrentSession(prev => {
        // If time is up, complete the session
        if (prev.timeRemaining <= 0) {
          clearInterval(timer);
          completeGoalSession();
          return prev;
        }
        
        // Update time remaining and earn XP for listening
        const newTimeRemaining = prev.timeRemaining - 1;
        const newEarnedXP = prev.earnedXP + (1/6); // 10 XP per minute = 1/6 XP per second
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          earnedXP: newEarnedXP
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentSession.isActive]);
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up pt-4">
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Podcast Goals
        </h1>
        
        <Tabs defaultValue={currentSession.isActive ? "active" : "set-goal"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="set-goal" disabled={currentSession.isActive}>
              Set Goal
            </TabsTrigger>
            <TabsTrigger value="active" disabled={!currentSession.isActive}>
              Active Session
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="set-goal" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time Goal
                </CardTitle>
                <CardDescription>
                  How many minutes would you like to listen today?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {goalSettings.timeGoal} minutes
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(goalSettings.timeGoal / 10)} XP per min = {goalSettings.timeGoal * 10} XP
                    </span>
                  </div>
                  
                  <Slider
                    defaultValue={[goalSettings.timeGoal]}
                    max={60}
                    min={5}
                    step={5}
                    onValueChange={handleTimeGoalChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Select Courses
                </CardTitle>
                <CardDescription>
                  Choose which subjects you want to focus on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => toggleCourseSelection(course.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        goalSettings.selectedCourses.includes(course.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{course.name}</div>
                      <div className="flex mt-1 space-x-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {course.exam}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          {course.board}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={startGoalSession} 
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Listening Session
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Recommended Podcasts</h2>
              <div className="space-y-3">
                {recommendedPodcasts.slice(0, 3).map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    {...podcast}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4 pt-4">
            {currentSession.isActive && currentSession.podcastsQueue.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Time Remaining
                      </div>
                      <div className="text-xl font-mono">
                        {formatTime(currentSession.timeRemaining)}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      You've earned {Math.floor(currentSession.earnedXP)} XP so far in this session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ 
                          width: `${100 - (currentSession.timeRemaining / (goalSettings.timeGoal * 60) * 100)}%` 
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg">Now Playing</h2>
                  
                  <Card className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                        
                        <div className="ml-4">
                          <h3 className="font-semibold text-lg">
                            {currentSession.podcastsQueue[currentSession.currentPodcastIndex].title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {currentSession.podcastsQueue[currentSession.currentPodcastIndex].courseName}
                          </p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {formatTime(currentSession.podcastsQueue[currentSession.currentPodcastIndex].duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={skipCurrentPodcast}
                        >
                          <SkipForward className="h-4 w-4 mr-1" />
                          Skip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {currentSession.podcastsQueue.length > currentSession.currentPodcastIndex + 1 && (
                    <>
                      <h2 className="font-semibold text-lg mt-4">Up Next</h2>
                      <div className="space-y-3">
                        {currentSession.podcastsQueue
                          .slice(currentSession.currentPodcastIndex + 1, currentSession.currentPodcastIndex + 3)
                          .map((podcast) => (
                            <PodcastCard
                              key={podcast.id}
                              {...podcast}
                            />
                          ))}
                      </div>
                    </>
                  )}
                  
                  <Button 
                    onClick={completeGoalSession} 
                    variant="destructive" 
                    className="w-full mt-4"
                  >
                    End Session
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Goals;
