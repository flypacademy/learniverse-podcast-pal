
import React from "react";

interface MiniPlayerThumbnailProps {
  thumbnailUrl?: string;
  title: string;
}

const MiniPlayerThumbnail = ({ thumbnailUrl, title }: MiniPlayerThumbnailProps) => {
  return (
    <div className="w-10 h-10 rounded-md bg-primary/10 flex-shrink-0 overflow-hidden">
      {thumbnailUrl ? (
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
          🎧
        </div>
      )}
    </div>
  );
};

export default MiniPlayerThumbnail;
