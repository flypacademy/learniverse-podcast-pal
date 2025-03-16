
import React from "react";
import { BarChart3, Clock } from "lucide-react";

interface CourseAboutProps {
  description: string;
  difficulty: string;
  totalDuration: number;
  exam?: string;
}

const CourseAbout: React.FC<CourseAboutProps> = ({
  description,
  difficulty,
  totalDuration,
  exam = "GCSE"
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Course Description</h3>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">What You'll Learn</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-primary">•</div>
            <p>Master key concepts and techniques</p>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-primary">•</div>
            <p>Practice with exam-style questions</p>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-0.5 text-primary">•</div>
            <p>Build confidence for your {exam} exams</p>
          </li>
        </ul>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-primary mr-3" />
          <div>
            <h4 className="font-medium text-sm">Difficulty Level</h4>
            <p className="text-xs text-gray-500">{difficulty}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-primary mr-3" />
          <div>
            <h4 className="font-medium text-sm">Total Duration</h4>
            <p className="text-xs text-gray-500">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAbout;
