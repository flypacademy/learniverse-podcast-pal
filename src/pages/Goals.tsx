
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoalCourses } from "@/hooks/useGoalCourses";
import { useToast } from "@/components/ui/use-toast";
import { useGoalSession } from "@/hooks/useGoalSession";
import GoalSettingsCard from "@/components/goals/GoalSettingsCard";
import RecommendedPodcastsList from "@/components/goals/RecommendedPodcastsList";
import ActiveSessionCard from "@/components/goals/ActiveSessionCard";
import LoadingState from "@/components/goals/LoadingState";

const Goals = () => {
  const { courses, podcasts, loading, error } = useGoalCourses();
  const [recommendedPodcasts, setRecommendedPodcasts] = useState([]);
  const { toast } = useToast();
  
  const {
    goalSettings,
    currentSession,
    handleTimeGoalChange,
    toggleCourseSelection,
    startGoalSession,
    completeGoalSession,
    skipCurrentPodcast,
    formatTime
  } = useGoalSession(recommendedPodcasts);
  
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
  }, [goalSettings, podcasts]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading data",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Show loading state with a skeleton UI instead of a toast
  if (loading) {
    return <LoadingState />;
  }
  
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
            <GoalSettingsCard 
              timeGoal={goalSettings.timeGoal}
              selectedCourses={goalSettings.selectedCourses}
              courses={courses}
              onTimeGoalChange={handleTimeGoalChange}
              toggleCourseSelection={toggleCourseSelection}
              startGoalSession={startGoalSession}
            />
            
            <RecommendedPodcastsList podcasts={recommendedPodcasts} />
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4 pt-4">
            {currentSession.isActive && currentSession.podcastsQueue.length > 0 && (
              <ActiveSessionCard 
                timeRemaining={currentSession.timeRemaining}
                earnedXP={currentSession.earnedXP}
                goalDuration={goalSettings.timeGoal}
                currentPodcast={currentSession.podcastsQueue[currentSession.currentPodcastIndex]}
                upNextPodcasts={currentSession.podcastsQueue.slice(
                  currentSession.currentPodcastIndex + 1, 
                  currentSession.currentPodcastIndex + 3
                )}
                onSkipPodcast={skipCurrentPodcast}
                onEndSession={completeGoalSession}
                formatTime={formatTime}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Goals;
