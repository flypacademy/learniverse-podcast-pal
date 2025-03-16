
import React from "react";

interface PodcastDescriptionProps {
  description: string;
}

const PodcastDescription = ({ description }: PodcastDescriptionProps) => {
  return (
    <div className="glass-card p-4 rounded-xl bg-gray-800/50 backdrop-blur border border-gray-700">
      <h3 className="font-medium mb-1 text-white">About this episode</h3>
      <p className="text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
};

export default PodcastDescription;
