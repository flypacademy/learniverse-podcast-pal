
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PodcastHeaderProps {
  courseName: string;
}

const PodcastHeader = ({ courseName }: PodcastHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="pt-2 flex items-center">
      <button 
        onClick={() => navigate(-1)} 
        className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div>
        <h1 className="font-display font-semibold text-lg text-gray-900">
          Now Playing
        </h1>
        <p className="text-sm text-gray-500">{courseName}</p>
      </div>
    </div>
  );
};

export default PodcastHeader;
