
import { useState, useEffect } from "react";
import { GoalPodcast } from "@/hooks/useGoalCourses";
import { useToast } from "@/components/ui/use-toast";

export interface GoalSettings {
  timeGoal: number; // in minutes
  selectedCourses: string[];
}

export interface CurrentSession {
  isActive: boolean;
  podcastsQueue: GoalPodcast[];
  currentPodcastIndex: number;
  timeRemaining: number; // in seconds
  earnedXP: number;
}

export function useGoalSession(recommendedPodcasts: GoalPodcast[]) {
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
  
  const { toast } = useToast();
  
  // Constants for XP calculation
  const XP_PER_MINUTE = 10;
  
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
    const earnedXP = minutesListened * XP_PER_MINUTE; // Consistent XP calculation
    
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
  
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        // Calculate XP earned at a rate of 10 XP per minute (which is 10/60 XP per second)
        const newTimeRemaining = prev.timeRemaining - 1;
        const newEarnedXP = prev.earnedXP + (XP_PER_MINUTE / 60); // XP_PER_MINUTE per minute = XP_PER_MINUTE/60 per second
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          earnedXP: newEarnedXP
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentSession.isActive]);
  
  return {
    goalSettings,
    currentSession,
    handleTimeGoalChange,
    toggleCourseSelection,
    startGoalSession,
    completeGoalSession,
    skipCurrentPodcast,
    formatTime
  };
}
