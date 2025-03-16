
import React from "react";

interface PodcastDescriptionProps {
  description: string;
  audioUrl?: string;
}

const PodcastDescription = ({ description, audioUrl }: PodcastDescriptionProps) => {
  return (
    <>
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-medium mb-1">About this episode</h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>
      
      {/* Audio URL Display - For debugging only */}
      {audioUrl && (
        <div className="text-xs text-gray-400 mt-2">
          <p>Audio URL: {audioUrl}</p>
        </div>
      )}
    </>
  );
};

export default PodcastDescription;
