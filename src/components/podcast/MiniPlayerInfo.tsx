
import React from "react";
import { Link } from "react-router-dom";
import MiniPlayerProgress from "./MiniPlayerProgress";

interface MiniPlayerInfoProps {
  podcastId: string;
  title: string;
  courseName: string;
  progress: number;
}

const MiniPlayerInfo = ({ 
  podcastId,
  title,
  courseName,
  progress
}: MiniPlayerInfoProps) => {
  return (
    <div className="flex-1 min-w-0">
      <Link to={`/podcast/${podcastId}`}>
        <h4 className="font-medium text-sm truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{courseName}</p>
      </Link>
      
      <MiniPlayerProgress progress={progress} />
    </div>
  );
};

export default MiniPlayerInfo;
