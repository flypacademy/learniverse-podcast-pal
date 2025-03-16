
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface CourseHeaderProps {
  title: string;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center space-x-2 pt-4">
      <Link 
        to="/courses"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </Link>
      <h1 className="font-display font-bold text-xl text-gray-900">
        {title}
      </h1>
    </div>
  );
};

export default CourseHeader;
