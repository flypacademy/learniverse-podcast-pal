
import React from "react";
import { useNavigate } from "react-router-dom";

interface PodcastErrorProps {
  error: string | null;
}

const PodcastError = ({ error }: PodcastErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl font-bold text-red-500">Error</h2>
      <p className="text-gray-600 mt-2">{error || "Failed to load audio player"}</p>
      <button 
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};

export default PodcastError;
