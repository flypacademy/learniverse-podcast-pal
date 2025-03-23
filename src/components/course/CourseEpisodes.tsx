
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
  header_text?: string | null;
}

interface CourseEpisodesProps {
  podcasts: Podcast[];
}

const CourseEpisodes: React.FC<CourseEpisodesProps> = ({ podcasts }) => {
  // Group podcasts by header
  const groupedPodcasts: Record<string, Podcast[]> = {};
  const noHeaderKey = "no_header";
  
  // Group podcasts by header
  podcasts.forEach(podcast => {
    const key = podcast.header_text || noHeaderKey;
    if (!groupedPodcasts[key]) {
      groupedPodcasts[key] = [];
    }
    groupedPodcasts[key].push(podcast);
  });
  
  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <Play className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="font-medium text-gray-700">No episodes yet</h3>
        <p className="text-gray-500 text-sm mt-1">
          Check back later for new content
        </p>
      </div>
    );
  }
  
  // More detailed debug logging
  console.log("CourseEpisodes: Raw podcast data:", podcasts);
  console.log("CourseEpisodes: Podcasts completion status:", podcasts.map(p => ({
    id: p.id,
    title: p.title,
    completed: p.completed,
    progress: p.progress,
    completedType: typeof p.completed
  })));
  
  return (
    <div className="space-y-6 pt-4">
      {/* No header section */}
      {groupedPodcasts[noHeaderKey] && (
        <div className="space-y-4">
          {groupedPodcasts[noHeaderKey].map((podcast) => (
            <PodcastCard 
              key={podcast.id}
              {...podcast}
            />
          ))}
        </div>
      )}
      
      {/* Sections with headers */}
      {Object.entries(groupedPodcasts)
        .filter(([header]) => header !== noHeaderKey)
        .map(([header, podcasts]) => (
          <div key={header} className="space-y-4">
            <h3 className="font-medium text-lg">{header}</h3>
            {podcasts.map((podcast) => (
              <PodcastCard 
                key={podcast.id}
                {...podcast}
              />
            ))}
          </div>
        ))}
    </div>
  );
};

export default CourseEpisodes;
