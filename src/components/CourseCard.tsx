
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  subject: "math" | "english" | "science" | "history" | "languages";
  totalPodcasts: number;
  completedPodcasts: number;
  image?: string;
}

const CourseCard = ({ 
  id, 
  title, 
  subject, 
  totalPodcasts, 
  completedPodcasts,
  image 
}: CourseCardProps) => {
  const progress = totalPodcasts > 0 ? (completedPodcasts / totalPodcasts) * 100 : 0;
  
  const gradientClass = {
    math: "bg-math-gradient",
    english: "bg-english-gradient",
    science: "bg-science-gradient",
    history: "bg-history-gradient",
    languages: "bg-languages-gradient",
  }[subject];

  return (
    <Link to={`/courses/${id}`} className="course-card group">
      <div className={`h-32 ${gradientClass}`}>
        {image && (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover mix-blend-overlay opacity-60"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <span className="badge bg-primary/10 text-primary">
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <BookOpen className="h-4 w-4 mr-1" />
          <span>{totalPodcasts} podcasts</span>
        </div>
        
        <div className="space-y-1">
          <div className="progress-bar">
            <div 
              className={`progress-value ${gradientClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{completedPodcasts} completed</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
