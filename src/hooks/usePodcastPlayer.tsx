
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAudioStore } from "@/lib/audioContext";
import { useProgressTracking } from "@/hooks/podcast/useProgressTracking";
import { useAudioPlayer } from "@/hooks/podcast/useAudioPlayer";
import { usePodcastData } from "@/hooks/podcast/usePodcastData";

export function usePodcastPlayer() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  
  // Use the audio player hook
  const {
    ready,
    setReady,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
  } = useAudioPlayer(podcastId || "");
  
  // Use the podcast data hook - call without arguments
  const {
    podcastData,
    courseData,
    loading,
    error,
    refetchPodcastData
  } = usePodcastData();
  
  // Use the progress tracking hook
  const {
    handleCompletion,
    showXpModal: trackingShowXpModal,
    xpEarned: trackingXpEarned
  } = useProgressTracking(
    podcastId,
    audioRef,
    isPlaying,
    podcastData?.course_id
  );
  
  // Sync XP modal state from progress tracking
  useEffect(() => {
    if (trackingShowXpModal) {
      setShowXPModal(true);
      setXpEarned(trackingXpEarned);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowXPModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [trackingShowXpModal, trackingXpEarned]);
  
  // Check if this podcast has a quiz
  useEffect(() => {
    const checkQuizAvailability = async () => {
      if (!podcastId) return;
      
      try {
        const { count, error } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('podcast_id', podcastId);
        
        if (error) {
          console.error("Error checking quiz availability:", error);
          return;
        }
        
        setIsQuizAvailable(count ? count > 0 : false);
      } catch (err) {
        console.error("Exception checking quiz availability:", err);
      }
    };
    
    checkQuizAvailability();
  }, [podcastId]);
  
  return {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    setReady,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
    isQuizAvailable,
    showXPModal,
    setShowXPModal,
    xpEarned,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
    refetchPodcastData,
    handleCompletion
  };
}
