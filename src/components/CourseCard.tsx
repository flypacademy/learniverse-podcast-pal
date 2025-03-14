
import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

interface CourseCardProps {
  id: string;
  title: string;
  subject: "math" | "english" | "science" | "history" | "languages";
  totalPodcasts: number;
  completedPodcasts: number;
  image: string;
}

const CourseCard = ({
  id,
  title,
  subject,
  totalPodcasts,
  completedPodcasts,
  image
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
    <Link to={`/course/${id}`} className="block">
      <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <div
          className={`h-24 ${getGradientClass()} relative flex items-end p-3`}
        >
          <img
            src={image}
            alt={title}
            className="absolute inset-0 mix-blend-overlay w-full h-full object-cover"
          />
          <h3 className="text-white font-medium text-sm relative z-10">
            {title}
          </h3>
        </div>
        <div className="p-3 bg-white">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <ProgressBar
            progress={completionPercentage}
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
