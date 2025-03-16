
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Headphones, Award, Star, Flame, Trophy } from "lucide-react";
import { Card } from "./ui/card";

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

  const getSubjectColor = () => {
    switch (subject) {
      case "math": return "text-podcast-math";
      case "english": return "text-podcast-english";
      case "science": return "text-podcast-science";
      case "history": return "text-podcast-history";
      case "languages": return "text-podcast-languages";
      default: return "text-podcast-math";
    }
  };

  const getGradientClass = () => {
    switch (subject) {
      case "math": return "bg-math-gradient";
      case "english": return "bg-english-gradient";
      case "science": return "bg-science-gradient";
      case "history": return "bg-history-gradient";
      case "languages": return "bg-languages-gradient";
      default: return "bg-math-gradient";
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
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full relative">
        {/* Card Header with Image/Gradient */}
        <div className={`relative ${size === 'large' ? 'aspect-[3/2]' : 'aspect-[2/1]'}`}>
          {/* Background image or gradient */}
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${getGradientClass()} flex items-center justify-center`}>
              <Headphones className="h-16 w-16 text-white/80" />
            </div>
          )}
          
          {/* Course title - prominent display */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {/* Top section with badges */}
            <div className="p-3 flex justify-between items-start">
              {/* Achievement badges */}
              {achievements.length > 0 && (
                <div className="flex -space-x-2">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index}
                      className="h-9 w-9 rounded-full bg-yellow-400 flex items-center justify-center shadow-md border-2 border-white"
                      title={`${achievement.type} ${achievement.value || ''}`}
                    >
                      {achievement.type === "streak" && <Flame className="h-5 w-5 text-white" />}
                      {achievement.type === "popular" && <Star className="h-5 w-5 text-white" />}
                      {achievement.type === "recommended" && <Award className="h-5 w-5 text-white" />}
                      {achievement.type === "complete" && <Trophy className="h-5 w-5 text-white" />}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Exam and board badges */}
              <div className="flex flex-col space-y-1.5">
                <span className="text-xs font-medium px-2.5 py-1 bg-blue-100/90 text-blue-700 rounded-full backdrop-blur-sm shadow-sm">
                  {exam}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 bg-purple-100/90 text-purple-700 rounded-full backdrop-blur-sm shadow-sm">
                  {board}
                </span>
              </div>
            </div>
            
            {/* Bottom section with course name and subject badge */}
            <div className="bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-3 px-4">
              <div className="bg-primary/20 backdrop-blur-sm rounded-full px-3.5 py-1 w-fit mb-2">
                <p className="text-white font-medium text-sm">{subject} Course</p>
              </div>
              <h3 className="text-white font-bold text-2xl leading-tight drop-shadow-lg">
                {title}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Progress section */}
        <div className="p-4 bg-white">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="font-medium text-primary">{completionPercentage}%</span>
          </div>
          <ProgressBar
            value={completionPercentage}
            color={`bg-primary`}
            size="md"
          />
          <div className="mt-2 text-xs text-gray-600 font-medium">
            {completedPodcasts} of {totalPodcasts} podcasts completed
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;
