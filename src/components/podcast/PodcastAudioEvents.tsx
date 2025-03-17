
import React from "react";

interface PodcastAudioEventsProps {
  handleAudioLoadedMetadata: () => void;
  handleAudioTimeUpdate: () => void;
  handleAudioEnded: () => void;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
  children: React.ReactNode;
}

const PodcastAudioEvents = ({
  handleAudioLoadedMetadata,
  handleAudioTimeUpdate,
  handleAudioEnded,
  handleAudioPlay,
  handleAudioPause,
  handleAudioError,
  children
}: PodcastAudioEventsProps) => {
  // This component serves as a container for audio event handlers
  // that will be passed down to the PodcastAudio component
  return <>{children}</>;
};

export default PodcastAudioEvents;
