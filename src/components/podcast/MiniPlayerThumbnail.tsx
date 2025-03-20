
import React from "react";
import { Link } from "react-router-dom";

interface MiniPlayerThumbnailProps {
  thumbnailUrl?: string;
  title: string;
}

const MiniPlayerThumbnail = ({ thumbnailUrl, title }: MiniPlayerThumbnailProps) => {
  return (
    <div className="shrink-0">
      <div className="h-12 w-12 rounded-md overflow-hidden shadow-sm">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-lg text-white">🎧</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniPlayerThumbnail;
