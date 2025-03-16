
import React from "react";
import { Clock } from "lucide-react";

interface CourseBannerProps {
  title: string;
  description: string;
  difficulty: string;
  totalDuration: number;
  subject: string;
  image: string;
}

const CourseBanner: React.FC<CourseBannerProps> = ({
  title,
  description,
  difficulty,
  totalDuration,
  subject,
  image
}) => {
  const subjectGradient = subject === "math" ? "bg-math-gradient" : 
                         subject === "english" ? "bg-english-gradient" : 
                         "bg-science-gradient";
  
  return (
    <div className={`rounded-xl overflow-hidden relative ${subjectGradient}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10 p-6 flex flex-col justify-end">
        <h2 className="font-display font-bold text-2xl text-white mb-1">
          {title}
        </h2>
        <p className="text-white/90 text-sm mb-4">
          {description}
        </p>
        <div className="flex justify-between items-center">
          <div className="text-white text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
            {difficulty}
          </div>
          <div className="flex items-center text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </div>
        </div>
      </div>
      <img 
        src={image} 
        alt={title}
        className="w-full h-48 object-cover"
      />
    </div>
  );
};

export default CourseBanner;
