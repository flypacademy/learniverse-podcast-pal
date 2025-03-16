
import React from "react";

interface PodcastInfoProps {
  title: string;
  courseName: string;
}

const PodcastInfo = ({ title, courseName }: PodcastInfoProps) => {
  return (
    <div className="text-center space-y-1">
      <h2 className="font-display font-bold text-xl text-gray-900">
        {title}
      </h2>
      <p className="text-gray-500">{courseName}</p>
    </div>
  );
};

export default PodcastInfo;
