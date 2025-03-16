
import React from "react";
import { Play } from "lucide-react";
import PodcastCard from "@/components/PodcastCard";

interface Podcast {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number;
  progress: number;
  completed: boolean;
  image: string;
}

interface CourseEpisodesProps {
  podcasts: Podcast[];
}

const CourseEpisodes: React.FC<CourseEpisodesProps> = ({ podcasts }) => {
  return (
    <div className="space-y-4 pt-4">
      {podcasts.length > 0 ? (
        podcasts.map((podcast) => (
          <PodcastCard 
            key={podcast.id}
            {...podcast}
          />
        ))
      ) : (
        <div className="text-center py-8">
          <Play className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-medium text-gray-700">No episodes yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Check back later for new content
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseEpisodes;
