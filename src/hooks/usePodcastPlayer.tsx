
import { useState } from "react";
import { useAudioContext } from "./useAudioContext";

const usePodcastPlayer = (audioUrl: string) => {
  const [showQuiz, setShowQuiz] = useState(false);
  
  const {
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    volume,
    handleVolumeChange,
    handleSeek,
    skipForward,
    skipBackward
  } = useAudioContext();
  
  const showQuizModal = () => {
    setShowQuiz(true);
  };
  
  const hideQuizModal = () => {
    setShowQuiz(false);
  };
  
  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    showQuiz,
    togglePlayPause,
    handleVolumeChange,
    handleSeek,
    skipForward,
    skipBackward,
    showQuizModal,
    hideQuizModal
  };
};

export default usePodcastPlayer;
