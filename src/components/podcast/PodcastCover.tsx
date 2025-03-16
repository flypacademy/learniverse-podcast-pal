
import React from "react";

interface PodcastCoverProps {
  imageUrl: string;
  alt: string;
}

const PodcastCover = ({ imageUrl, alt }: PodcastCoverProps) => {
  return (
    <div className="rounded-xl overflow-hidden aspect-square shadow-lg border border-gray-700">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to placeholder on error
          e.currentTarget.src = "/placeholder.svg";
        }}
      />
    </div>
  );
};

export default PodcastCover;
