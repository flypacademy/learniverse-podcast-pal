
import React from "react";

interface PodcastInfoProps {
  title: string;
  courseName: string;
}

const PodcastInfo = ({ title, courseName }: PodcastInfoProps) => {
  return (
    <div className="text-center space-y-2 mb-6">
      <h2 className="font-display font-bold text-2xl text-gray-900 leading-tight">
        {title}
      </h2>
      <p className="text-gray-500 font-medium text-sm">{courseName || "Unknown Course"}</p>
    </div>
  );
};

export default PodcastInfo;
