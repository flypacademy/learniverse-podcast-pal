
import React from "react";
import ProgressBar from "@/components/ProgressBar";

interface CourseProgressProps {
  completedPodcasts: number;
  totalPodcasts: number;
  subject: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({
  completedPodcasts,
  totalPodcasts,
  subject
}) => {
  const completionPercentage = Math.round((completedPodcasts / totalPodcasts) * 100) || 0;
  
  const progressColor = subject === "math" ? "bg-math-gradient" : 
                       subject === "english" ? "bg-english-gradient" : 
                       "bg-science-gradient";
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Your Progress</h3>
        <span className="text-sm text-gray-500">
          {completedPodcasts}/{totalPodcasts} completed
        </span>
      </div>
      <ProgressBar 
        value={completionPercentage}
        color={progressColor}
      />
    </div>
  );
};

export default CourseProgress;
