
import React from "react";
import { Headphones } from "lucide-react";

interface PodcastCoverProps {
  image?: string;
  title: string;
}

const PodcastCover = ({ image, title }: PodcastCoverProps) => {
  return (
    <div className="aspect-square max-w-xs mx-auto relative">
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-math-gradient flex items-center justify-center">
            <Headphones className="h-20 w-20 text-white/70" />
          </div>
        )}
      </div>
      
      {/* Floating album-like circles for design */}
      <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-brand-yellow/30 backdrop-blur-lg"></div>
      <div className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-brand-purple/20 backdrop-blur-lg"></div>
    </div>
  );
};

export default PodcastCover;
