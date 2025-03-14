
import React from "react";
import { Link } from "react-router-dom";
import { Play, Check, Clock } from "lucide-react";

interface PodcastCardProps {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number; // in seconds
  progress: number; // 0-100
  completed: boolean;
  image?: string;
}

const PodcastCard = ({
  id,
  title,
  courseId,
  courseName,
  duration,
  progress,
  completed,
  image
}: PodcastCardProps) => {
  // Format duration to mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Link 
      to={`/podcast/${id}`} 
      className="podcast-card flex items-center gap-3 group"
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
        
        {completed ? (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{title}</h4>
        <p className="text-sm text-gray-500 truncate">{courseName}</p>
        
        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDuration(duration)}</span>
          </div>
          
          {!completed && progress > 0 && (
            <div className="flex-1 progress-bar h-1.5 max-w-[100px]">
              <div 
                className="progress-value bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;
