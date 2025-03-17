
import React from "react";

interface PodcastAudioProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src?: string;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  onError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
}

const PodcastAudio = ({
  audioRef,
  src,
  onLoadedMetadata,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onError
}: PodcastAudioProps) => {
  return (
    <audio
      ref={audioRef}
      src={src}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      onPlay={onPlay}
      onPause={onPause}
      onError={onError}
      preload="metadata"
      className="hidden"
    />
  );
};

export default PodcastAudio;
