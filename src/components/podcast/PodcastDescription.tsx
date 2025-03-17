
import React from "react";

interface PodcastDescriptionProps {
  description: string;
}

const PodcastDescription = ({ description }: PodcastDescriptionProps) => {
  return (
    <div className="rounded-2xl">
      <h3 className="font-display font-semibold text-lg mb-2">About this episode</h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default PodcastDescription;
