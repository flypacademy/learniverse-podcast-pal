
import React from "react";
import { Headphones } from "lucide-react";

interface PodcastCoverProps {
  image?: string;
  title: string;
}

const PodcastCover = ({ image, title }: PodcastCoverProps) => {
  return (
    <div className="aspect-square max-w-xs mx-auto relative mb-6">
      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-math-gradient flex items-center justify-center">
            <Headphones className="h-24 w-24 text-white/80" />
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-3 -right-3 h-16 w-16 rounded-full bg-brand-yellow/40 backdrop-blur-lg animate-pulse-subtle"></div>
      <div className="absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-brand-purple/30 backdrop-blur-lg animate-float"></div>
      <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-brand-blue/20 backdrop-blur-lg animate-pulse-subtle"></div>
    </div>
  );
};

export default PodcastCover;
