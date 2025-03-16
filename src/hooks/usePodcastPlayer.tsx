import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/lib/audioContext";

export interface PodcastData {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string | null;
  duration: number;
  description?: string | null;
  course_id?: string;
}

interface PodcastProgressData {
  last_position: number;
  completed: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  image?: string;
}

export function usePodcastPlayer() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const globalAudioStore = useAudioStore();
  
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialSyncRef = useRef(true);
  const progressIntervalRef = useRef<number | null>(null);
  const isPlayAttemptedRef = useRef(false);
  
  // Check if this podcast is already playing in the global store
  // But only sync once to avoid infinite updates
  useEffect(() => {
    if (podcastId && globalAudioStore.currentPodcastId === podcastId && isInitialSyncRef.current) {
      console.log("This podcast is already in the global store, syncing state");
      setIsPlaying(globalAudioStore.isPlaying);
      setCurrentTime(globalAudioStore.currentTime);
      setDuration(globalAudioStore.duration);
      // Convert the global volume value (0-1) to a local volume value (0-1)
      setVolume(globalAudioStore.volume);
      isInitialSyncRef.current = false;
    }
  }, [podcastId, globalAudioStore]);
  
  useEffect(() => {
    console.log("usePodcastPlayer hook - Initial render with podcastId:", podcastId);
    
    async function fetchPodcastData() {
      if (!podcastId) {
        console.error("No podcastId provided");
        setError("No podcast ID found");
        setLoading(false);
        return;
      }
      
      console.log("Fetching podcast data for ID:", podcastId);
      
      try {
        // Fetch podcast data with timeout handling
        const podcastPromise = supabase
          .from('podcasts')
          .select('*')
          .eq('id', podcastId)
          .single();
          
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Podcast fetch timed out")), 10000)
        );
        
        const { data: podcastData, error: podcastError } = await Promise.race([
          podcastPromise,
          timeoutPromise
        ]) as any;
        
        if (podcastError) {
          console.error("Error fetching podcast:", podcastError);
          throw podcastError;
        }
        
        if (!podcastData) {
          console.error("Podcast not found");
          throw new Error('Podcast not found');
        }
        
        console.log("Podcast data fetched successfully:", podcastData);
        setPodcastData(podcastData);
        
        if (podcastData.course_id) {
          console.log("Fetching course data for course ID:", podcastData.course_id);
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, title, image_url')
            .eq('id', podcastData.course_id)
            .maybeSingle();
          
          if (courseError) {
            console.error("Error fetching course:", courseError);
          } else if (courseData) {
            console.log("Course data fetched successfully:", courseData);
            const formattedCourseData: CourseData = {
              id: courseData.id,
              title: courseData.title,
              image: courseData.image_url
            };
            setCourseData(formattedCourseData);
          }
        }
        
        const { count, error: quizError } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('podcast_id', podcastId);
        
        if (quizError) {
          console.error("Error checking quiz:", quizError);
        } else {
          console.log("Quiz questions count:", count);
          setIsQuizAvailable(!!count && count > 0);
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("User session found, fetching progress data");
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('last_position, completed')
            .eq('podcast_id', podcastId)
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (progressData) {
            console.log("Progress data found:", progressData);
            handleProgressData(progressData);
          }
        }
        
      } catch (error: any) {
        console.error("Error in fetchPodcastData:", error);
        setError(error.message || "Failed to load podcast");
        toast({
          title: "Error",
          description: "Failed to load podcast: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchPodcastData();
    
    // Cleanup function
    return () => {
      console.log("usePodcastPlayer hook - Cleaning up");
      if (audioRef.current && !globalAudioStore.audioElement) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Clear any progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [podcastId, toast, globalAudioStore.audioElement]);
  
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0) {
      console.log("Setting initial time from progress data:", progressData.last_position);
      setCurrentTime(progressData.last_position);
      if (audioRef.current) {
        audioRef.current.currentTime = progressData.last_position;
      }
    }
  };
  
  const play = () => {
    if (!audioRef.current) {
      console.warn("Play called but audioRef is null");
      return;
    }
    
    console.log("Playing audio");
    isPlayAttemptedRef.current = true;
    
    // Check if the audio is actually loaded and ready
    if (audioRef.current.readyState < 2) {
      console.log("Audio not ready yet, loading...");
      
      const canPlayHandler = () => {
        console.log("Audio is now ready to play");
        audioRef.current?.play()
          .then(() => {
            console.log("Audio playback started successfully");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            toast({
              title: "Playback Error",
              description: "Could not play audio: " + err.message,
              variant: "destructive"
            });
          });
        
        // Remove event listener
        audioRef.current?.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioRef.current.addEventListener('canplay', canPlayHandler);
      
      // Also set a timeout in case canplay never fires
      setTimeout(() => {
        if (!isPlaying && isPlayAttemptedRef.current) {
          console.log("Timeout: trying to play anyway");
          audioRef.current?.play()
            .then(() => {
              console.log("Audio playback started successfully after timeout");
              setIsPlaying(true);
            })
            .catch(err => {
              console.error("Error playing audio after timeout:", err);
              toast({
                title: "Playback Error",
                description: "Could not play audio. Try reloading the page.",
                variant: "destructive"
              });
            });
        }
      }, 2000);
      
      return;
    }
    
    // If audio is already loaded, try to play directly
    audioRef.current.play()
      .then(() => {
        console.log("Audio playback started successfully");
        setIsPlaying(true);
      })
      .catch(err => {
        console.error("Error playing audio:", err);
        toast({
          title: "Playback Error",
          description: "Could not play audio: " + err.message,
          variant: "destructive"
        });
      });
  };
  
  const pause = () => {
    if (audioRef.current) {
      console.log("Pausing audio");
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.warn("Pause called but audioRef is null");
    }
  };
  
  const togglePlayPause = () => {
    console.log("Toggle play/pause, current state:", isPlaying);
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      console.log("Seeking to time:", time);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      console.warn("Seek called but audioRef is null");
    }
  };
  
  const changeVolume = (value: number) => {
    if (audioRef.current) {
      // Ensure value is between 0 and 1
      const safeValue = Math.max(0, Math.min(1, value));
      console.log("Changing volume to:", safeValue);
      audioRef.current.volume = safeValue;
      setVolume(safeValue);
    } else {
      console.warn("changeVolume called but audioRef is null");
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 15);
      console.log("Skipping forward to:", newTime);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.warn("skipForward called but audioRef is null");
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      console.log("Skipping backward to:", newTime);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.warn("skipBackward called but audioRef is null");
    }
  };
  
  const saveProgress = async (completed = false) => {
    if (!audioRef.current || !podcastId) {
      console.warn("saveProgress called but audioRef or podcastId is null");
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("No user session found, not saving progress");
      return;
    }
    
    const userId = session.user.id;
    const last_position = Math.floor(audioRef.current.currentTime);
    
    console.log("Saving progress:", { podcastId, userId, last_position, completed });
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert([
          {
            user_id: userId,
            podcast_id: podcastId,
            last_position: last_position,
            completed: completed,
            course_id: podcastData?.course_id
          }
        ]);
      
      if (error) {
        console.error("Error saving progress:", error);
      } else {
        console.log("Progress saved successfully");
      }
    } catch (error) {
      console.error("Exception saving progress:", error);
    }
  };
  
  // Set up progress saving interval using ref to avoid creating new intervals
  useEffect(() => {
    // Clean up any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Only start a new interval if we're playing
    if (isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        saveProgress();
      }, 10000);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, podcastId]);
  
  const handleCompletion = async () => {
    console.log("Handling podcast completion");
    await saveProgress(true);
    setShowXPModal(true);
  };
  
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
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    skipForward,
    skipBackward,
    handleCompletion
  };
}
