
import React from "react";
import { Clock, SkipForward, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoalPodcast } from "@/hooks/useGoalCourses";
import PodcastCard from "@/components/PodcastCard";

interface ActiveSessionCardProps {
  timeRemaining: number;
  earnedXP: number;
  goalDuration: number;
  currentPodcast: GoalPodcast;
  upNextPodcasts: GoalPodcast[];
  onSkipPodcast: () => void;
  onEndSession: () => void;
  formatTime: (seconds: number) => string;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  timeRemaining,
  earnedXP,
  goalDuration,
  currentPodcast,
  upNextPodcasts,
  onSkipPodcast,
  onEndSession,
  formatTime
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Time Remaining
            </div>
            <div className="text-xl font-mono">
              {formatTime(timeRemaining)}
            </div>
          </CardTitle>
          <CardDescription>
            You've earned {Math.floor(earnedXP)} XP so far in this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ 
                width: `${100 - (timeRemaining / (goalDuration * 60) * 100)}%` 
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
                  {currentPodcast.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentPodcast.courseName}
                </p>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {formatTime(currentPodcast.duration)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSkipPodcast}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {upNextPodcasts.length > 0 && (
          <>
            <h2 className="font-semibold text-lg mt-4">Up Next</h2>
            <div className="space-y-3">
              {upNextPodcasts.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  {...podcast}
                />
              ))}
            </div>
          </>
        )}
        
        <Button 
          onClick={onEndSession} 
          variant="destructive" 
          className="w-full mt-4"
        >
          End Session
        </Button>
      </div>
    </div>
  );
};

export default ActiveSessionCard;
