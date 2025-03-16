
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Headphones, Award, Star, Flame, Trophy } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface CourseCardProps {
  id: string;
  title: string;
  subject: string;
  totalPodcasts: number;
  completedPodcasts: number;
  image: string;
  size?: "normal" | "large";
  exam?: string;
  board?: string;
  achievements?: {
    type: "streak" | "popular" | "recommended" | "complete";
    value?: number;
  }[];
}

const CourseCard = ({
  id,
  title,
  subject,
  totalPodcasts,
  completedPodcasts,
  image,
  size = "normal",
  exam = "GCSE",
  board = "AQA",
  achievements = []
}: CourseCardProps) => {
  const completionPercentage = Math.round(
    (completedPodcasts / totalPodcasts) * 100
  );

  const getCardGradient = () => {
    if (image) return "";
    
    switch (subject) {
      case "math": return "bg-gradient-to-br from-blue-500 to-indigo-700";
      case "english": return "bg-gradient-to-br from-purple-500 to-pink-700";
      case "science": return "bg-gradient-to-br from-teal-500 to-blue-700";
      case "history": return "bg-gradient-to-br from-amber-500 to-orange-700";
      case "languages": return "bg-gradient-to-br from-pink-500 to-purple-700";
      default: return "bg-gradient-to-br from-blue-500 to-indigo-700";
    }
  };

  const handleCardClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <Link 
      to={`/course/${id}`} 
      className={`block w-full ${size === 'large' ? 'md:max-w-full' : 'md:max-w-sm'}`} 
      onClick={handleCardClick}
    >
      <Card className="overflow-hidden rounded-xl hover:shadow-lg transition-all duration-300 h-full">
        {/* Card Header with Image */}
        <div className={`relative ${size === 'large' ? 'h-56' : 'h-48'}`}>
          {/* Background image or gradient */}
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${getCardGradient()}`} />
          )}
          
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Achievement badges */}
          {achievements.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-1">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
                  title={`${achievement.type} ${achievement.value || ''}`}
                >
                  {achievement.type === "streak" && <Flame className="h-5 w-5 text-amber-500" />}
                  {achievement.type === "recommended" && <Award className="h-5 w-5 text-blue-500" />}
                  {achievement.type === "popular" && <Star className="h-5 w-5 text-purple-500" />}
                  {achievement.type === "complete" && <Trophy className="h-5 w-5 text-green-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info section with glass effect */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-white/20">
          {/* Course title - moved here from image */}
          <h3 className="text-gray-900 font-bold text-xl leading-tight mb-3">
            {title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            {/* Exam & board info */}
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs bg-blue-50">
                {exam}
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-50">
                {board}
              </Badge>
            </div>
            
            {/* Podcasts info */}
            <div className="flex items-center text-gray-600 text-sm">
              <Headphones className="h-4 w-4 mr-1" />
              <span>{totalPodcasts} podcasts</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Course Progress</span>
              <span className="font-medium text-primary">{completionPercentage}%</span>
            </div>
            <ProgressBar
              value={completionPercentage}
              color={`bg-primary`}
              size="md"
            />
            <div className="mt-2 text-xs text-gray-600">
              {completedPodcasts} of {totalPodcasts} podcasts completed
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;
