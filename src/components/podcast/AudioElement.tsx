
import React, { RefObject } from "react";
import { toast } from "@/components/ui/use-toast";

interface AudioElementProps {
  audioRef: RefObject<HTMLAudioElement>;
  audioUrl: string;
  setDuration: (duration: number) => void;
  setReady: (ready: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  onAudioEnded: () => void;
  setHasError: (hasError: boolean) => void;
}

const AudioElement = ({
  audioRef,
  audioUrl,
  setDuration,
  setReady,
  setCurrentTime,
  setIsPlaying,
  onAudioEnded,
  setHasError
}: AudioElementProps) => {
  return (
    <audio
      ref={audioRef}
      src={audioUrl}
      onLoadedMetadata={() => {
        if (audioRef.current) {
          console.log("Audio loaded metadata:", {
            duration: audioRef.current.duration,
            src: audioRef.current.src
          });
          setDuration(audioRef.current.duration);
          setReady(true);
        }
      }}
      onError={(e) => {
        console.error("Audio element error:", e);
        setHasError(true);
        toast({
          title: "Error",
          description: "Failed to load audio",
          variant: "destructive"
        });
      }}
      onTimeUpdate={() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }}
      onEnded={onAudioEnded}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onCanPlay={() => {
        console.log("Audio is ready to play");
      }}
      preload="auto"
      className="hidden"
    />
  );
};

export default AudioElement;
