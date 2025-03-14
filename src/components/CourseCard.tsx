
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Headphones } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  subject: string;
  totalPodcasts: number;
  completedPodcasts: number;
  image: string;
  size?: "normal" | "large";
}

const CourseCard = ({
  id,
  title,
  subject,
  totalPodcasts,
  completedPodcasts,
  image,
  size = "normal"
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

  return (
    <Link to={`/course/${id}`} className={`block ${size === 'large' ? 'w-full' : ''}`}>
      <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${size === 'large' ? 'p-0' : ''}`}>
        <div
          className={`rounded-xl overflow-hidden ${size === 'large' ? 'aspect-[3/2]' : 'aspect-[2/1]'} relative`}
        >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-white font-medium text-lg">{title}</h3>
          </div>
          
          {/* New frosted glass progress overlay */}
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
