
import React from "react";
import { GoalPodcast } from "@/hooks/useGoalCourses";
import PodcastCard from "@/components/PodcastCard";
import { useAudioStore } from "@/lib/audioContext";

interface RecommendedPodcastsListProps {
  podcasts: GoalPodcast[];
}

const RecommendedPodcastsList: React.FC<RecommendedPodcastsListProps> = ({ podcasts }) => {
  const audioStore = useAudioStore();

  // When a user navigates to a podcast from the recommendations,
  // ensure we pause any currently playing audio to prevent duplicates
  const handlePodcastClick = () => {
    const { audioElement } = audioStore;
    if (audioElement && !audioElement.paused) {
      console.log("Pausing current audio before navigating to new podcast");
      audioElement.pause();
      audioStore.pause();
    }
  };
  
  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg">Recommended Podcasts</h2>
      <div className="space-y-3">
        {podcasts.slice(0, 3).map((podcast) => (
          <PodcastCard
            key={podcast.id}
            {...podcast}
            onClick={handlePodcastClick}
          />
        ))}
        {podcasts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No podcasts available. Please select a course.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedPodcastsList;
