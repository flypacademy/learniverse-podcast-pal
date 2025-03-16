
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
  
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [podcastId, toast]);
  
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
    if (audioRef.current) {
      console.log("Playing audio");
      audioRef.current.play()
        .then(() => {
          console.log("Audio playback started successfully");
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          toast({
            title: "Playback Error",
            description: "Could not play audio: " + err.message,
            variant: "destructive"
          });
        });
      setIsPlaying(true);
    } else {
      console.warn("Play called but audioRef is null");
    }
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
      console.log("Changing volume to:", value);
      audioRef.current.volume = value;
      setVolume(value);
    } else {
      console.warn("changeVolume called but audioRef is null");
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
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
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying) {
        saveProgress();
      }
    }, 10000);
    
    return () => clearInterval(progressInterval);
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
