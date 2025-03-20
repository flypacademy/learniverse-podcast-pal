
import React from "react";
import { useLocation } from "react-router-dom";
import { useAudioStore } from "@/lib/audioContext";
import PodcastMiniPlayer from "./podcast/MiniPlayer";

const MiniPlayer = () => {
  const location = useLocation();
  const { audioSrc, currentPodcast } = useAudioStore();
  
  // Don't show mini player on the podcast player page itself
  if (location.pathname.startsWith("/podcast/")) {
    return null;
  }
  
  // Only show when there's an active audio
  if (!audioSrc || !currentPodcast) {
    return null;
  }
  
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
      <PodcastMiniPlayer
        podcastId={currentPodcast.id}
        title={currentPodcast.title}
        courseName={currentPodcast.courseName || ""}
        thumbnailUrl={currentPodcast.thumbnailUrl}
      />
    </div>
  );
};

export default MiniPlayer;
