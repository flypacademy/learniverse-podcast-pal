
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { Headphones } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  subject: "math" | "english" | "science" | "history" | "languages";
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
          className={`rounded-xl overflow-hidden ${size === 'large' ? 'aspect-[4/3]' : 'aspect-[2/1]'} relative`}
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
        </div>
        <div className="p-3 bg-white">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <ProgressBar
            value={completionPercentage}
            color={getGradientClass()}
          />
          <div className="mt-2 text-xs text-gray-500">
            {completedPodcasts} of {totalPodcasts} podcasts
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
