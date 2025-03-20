
import React from "react";
import { useLocation } from "react-router-dom";
import { useAudioStore, PodcastMeta } from "@/lib/audioContext";
import PodcastMiniPlayer from "./podcast/MiniPlayer";

const MiniPlayer = () => {
  const location = useLocation();
  const { audioElement, podcastMeta } = useAudioStore();
  
  // Don't show mini player on the podcast player page itself
  if (location.pathname.startsWith("/podcast/")) {
    return null;
  }
  
  // Only show when there's an active audio and podcast metadata
  if (!audioElement || !podcastMeta) {
    return null;
  }
  
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4">
      <PodcastMiniPlayer
        podcastId={podcastMeta.id}
        title={podcastMeta.title}
        courseName={podcastMeta.courseName || ""}
        thumbnailUrl={podcastMeta.image}
      />
    </div>
  );
};

export default MiniPlayer;
