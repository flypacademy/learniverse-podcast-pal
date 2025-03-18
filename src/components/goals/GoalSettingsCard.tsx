
import React from "react";
import { Clock, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCourse } from "@/hooks/useGoalCourses";
import { useToast } from "@/components/ui/use-toast";

interface GoalSettingsProps {
  timeGoal: number;
  selectedCourses: string[];
  courses: GoalCourse[];
  onTimeGoalChange: (value: number[]) => void;
  toggleCourseSelection: (courseId: string) => void;
  startGoalSession: () => void;
}

const GoalSettingsCard: React.FC<GoalSettingsProps> = ({
  timeGoal,
  selectedCourses,
  courses,
  onTimeGoalChange,
  toggleCourseSelection,
  startGoalSession
}) => {
  // Calculate XP consistently - always 10 XP per minute
  const xpPerMinute = 10;
  const totalXP = timeGoal * xpPerMinute;
  
  return (
    <>
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
                {timeGoal} minutes
              </span>
              <span className="text-sm text-gray-500">
                {xpPerMinute} XP per min = {totalXP} XP
              </span>
            </div>
            
            <Slider
              defaultValue={[timeGoal]}
              max={60}
              min={5}
              step={5}
              onValueChange={onTimeGoalChange}
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
                  selectedCourses.includes(course.id)
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
    </>
  );
};

export default GoalSettingsCard;
