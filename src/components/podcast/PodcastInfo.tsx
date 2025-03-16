
import React from "react";
import { Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface PodcastInfoProps {
  title: string;
  duration: number;
}

const PodcastInfo = ({ title, duration }: PodcastInfoProps) => {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xl font-medium text-white">{title}</h2>
      
      <div className="flex items-center text-gray-400 text-sm">
        <Clock className="h-4 w-4 mr-1" />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default PodcastInfo;
