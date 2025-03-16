
import React from "react";

interface PodcastDescriptionProps {
  description: string;
}

const PodcastDescription = ({ description }: PodcastDescriptionProps) => {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h3 className="font-medium mb-1">About this episode</h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default PodcastDescription;
