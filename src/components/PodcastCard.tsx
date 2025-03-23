
import React from "react";
import { Link } from "react-router-dom";
import { Play, Check, Clock, Headphones, Award, Star } from "lucide-react";

interface PodcastCardProps {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number; // in seconds
  progress: number; // 0-100
  completed: boolean;
  image?: string;
  achievements?: {
    type: "popular" | "new" | "recommended" | "top";
    label: string;
  }[];
  exam?: string;
  board?: string;
  onClick?: () => void; // Add optional onClick handler
}

const PodcastCard = ({
  id,
  title,
  courseId,
  courseName,
  duration,
  progress,
  completed,
  image,
  achievements = [],
  exam = "GCSE",
  board = "AQA",
  onClick
}: PodcastCardProps) => {
  // Format duration to mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Extract subject name from course name
  const getSubject = (courseName: string): string => {
    return courseName.split(" ")[0];
  };
  
  // Force boolean conversion for completed to ensure it's a true boolean
  const isCompleted = completed === true;
  
  // Detailed debug logging for completion status
  console.log(`PodcastCard ${id} "${title}": completed=${completed}, type=${typeof completed}, isCompleted=${isCompleted}, progress=${progress}`);

  return (
    <Link 
      to={`/podcast/${id}`} 
      className="podcast-card flex items-center gap-3 group relative bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
      onClick={onClick} // Add the onClick handler to the Link component
    >
      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <Headphones className="h-8 w-8 text-primary/50" />
          </div>
        )}
        
        {isCompleted ? (
          <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 truncate max-w-[70%]">{title}</h4>
          
          {/* Achievement indicators */}
          {achievements.length > 0 && (
            <div className="flex -space-x-1">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="h-5 w-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm"
                  title={achievement.label}
                >
                  {achievement.type === "popular" && <Star className="h-3 w-3 text-white" />}
                  {achievement.type === "top" && <Award className="h-3 w-3 text-white" />}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {exam}
          </span>
          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">
            {board}
          </span>
        </div>
        
        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDuration(duration)}</span>
          </div>
          
          {!isCompleted && progress > 0 && (
            <div className="flex-1 progress-bar h-1.5 max-w-[100px] bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="progress-value bg-primary h-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {isCompleted && (
            <div className="text-xs text-green-600 font-medium flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Completed
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;
