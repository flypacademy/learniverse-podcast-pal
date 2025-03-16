
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Headphones, Award, Star, Flame, Trophy } from "lucide-react";

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

  const getGradientClass = () => {
    switch (subject) {
      case "math":
        return "bg-math-gradient";
      case "english":
        return "bg-english-gradient";
      case "science":
        return "bg-science-gradient";
      case "history":
        return "bg-history-gradient";
      case "languages":
        return "bg-languages-gradient";
      default:
        return "bg-math-gradient";
    }
  };

  const handleCardClick = () => {
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  return (
    <Link to={`/course/${id}`} className={`block ${size === 'large' ? 'w-full' : ''}`} onClick={handleCardClick}>
      <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${size === 'large' ? 'p-0' : ''}`}>
        <div
          className={`rounded-xl overflow-hidden ${size === 'large' ? 'aspect-[3/2]' : 'aspect-[2/1]'} relative`}
        >
          {/* Background image or gradient */}
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className={`w-full h-full ${getGradientClass()} flex items-center justify-center rounded-xl`}>
              <Headphones className="h-12 w-12 text-white/70" />
            </div>
          )}
          
          {/* Achievement badge indicators */}
          {achievements.length > 0 && (
            <div className="absolute top-2 left-2 flex -space-x-2">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-md border-2 border-white"
                  title={`${achievement.type} ${achievement.value || ''}`}
                >
                  {achievement.type === "streak" && <Flame className="h-4 w-4 text-white" />}
                  {achievement.type === "popular" && <Star className="h-4 w-4 text-white" />}
                  {achievement.type === "recommended" && <Award className="h-4 w-4 text-white" />}
                  {achievement.type === "complete" && <Trophy className="h-4 w-4 text-white" />}
                </div>
              ))}
            </div>
          )}
          
          {/* Exam and board tags */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <span className="text-xs px-2 py-0.5 bg-blue-100/90 text-blue-700 rounded-full backdrop-blur-sm">
              {exam}
            </span>
            <span className="text-xs px-2 py-0.5 bg-purple-100/90 text-purple-700 rounded-full backdrop-blur-sm">
              {board}
            </span>
          </div>
          
          {/* Course title overlay - Enhanced for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex flex-col items-start justify-end p-4">
            <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md mb-1">{title}</h3>
            <div className="flex items-center">
              <span className="text-white text-sm px-3 py-1 bg-primary/50 rounded-full backdrop-blur-sm font-medium">
                {subject} Course
              </span>
            </div>
          </div>
          
          {/* Frosted glass progress overlay */}
          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-white/30 p-3 border-t border-white/20">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white font-medium">Progress</span>
              <span className="text-white font-medium">{completionPercentage}%</span>
            </div>
            <ProgressBar
              value={completionPercentage}
              color={`bg-white`}
            />
            <div className="mt-2 text-xs text-white font-medium">
              {completedPodcasts} of {totalPodcasts} podcasts
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
