
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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
  const { podcastId } = useParams();
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
  const [volume, setVolume] = useState(80);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fetchAttempted = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (loading && !podcastData) {
        console.error("Podcast loading timeout reached");
        setError("Loading timeout reached. Please try again later.");
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout (reduced from 20)
    
    timeoutRef.current = timeoutId;
    
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, podcastData]);
  
  useEffect(() => {
    async function fetchPodcastData() {
      if (!podcastId || fetchAttempted.current) return;
      
      fetchAttempted.current = true;
      console.log("Fetching podcast data for ID:", podcastId);
      
      try {
        // Clear any previous timeout
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        
        setLoading(true);
        setError(null);
        
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', podcastId)
          .maybeSingle();
        
        if (podcastError) {
          console.error("Supabase error fetching podcast:", podcastError);
          throw podcastError;
        }
        
        if (!podcastData) {
          console.error("Podcast not found with ID:", podcastId);
          throw new Error('Podcast not found');
        }
        
        console.log("Podcast data fetched successfully:", podcastData);
        
        // Validate that audio_url exists
        if (!podcastData.audio_url) {
          console.error("Podcast has no audio URL:", podcastId);
          throw new Error('Podcast audio not available');
        }
        
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
            console.log("Course data fetched:", courseData);
            const formattedCourseData: CourseData = {
              id: courseData.id,
              title: courseData.title,
              image: courseData.image_url
            };
            setCourseData(formattedCourseData);
          }
        }
        
        try {
          const { count, error: quizError } = await supabase
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('podcast_id', podcastId);
          
          if (quizError) {
            console.error("Error checking quiz:", quizError);
          } else {
            setIsQuizAvailable(!!count && count > 0);
          }
        } catch (error) {
          console.error("Error checking quiz availability:", error);
        }
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('last_position, completed')
              .eq('podcast_id', podcastId)
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (progressData) {
              handleProgressData(progressData);
            }
          }
        } catch (error) {
          console.error("Error checking user session or progress:", error);
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
        console.log("Finished loading podcast data");
        setLoading(false);
      }
    }
    
    fetchPodcastData();
  }, [podcastId, toast]);
  
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0) {
      setCurrentTime(progressData.last_position);
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = progressData.last_position;
        } catch (error) {
          console.error("Error setting audio currentTime:", error);
        }
      }
    }
  };
  
  const play = () => {
    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              toast({
                title: "Playback Error",
                description: "Could not play audio: " + error.message,
                variant: "destructive"
              });
            });
        }
      } catch (error: any) {
        console.error("Exception during play:", error);
        toast({
          title: "Playback Error",
          description: "Error playing audio: " + (error.message || "Unknown error"),
          variant: "destructive"
        });
      }
    } else {
      console.warn("Audio element reference is not available");
    }
  };
  
  const pause = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing audio:", error);
    }
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (percent: number) => {
    if (audioRef.current && duration > 0) {
      try {
        const newTime = (percent / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } catch (error) {
        console.error("Error seeking audio:", error);
      }
    }
  };
  
  const changeVolume = (value: number) => {
    if (audioRef.current) {
      try {
        const volumeValue = value / 100;
        audioRef.current.volume = Math.max(0, Math.min(1, volumeValue));
        setVolume(value);
      } catch (error) {
        console.error("Error changing volume:", error);
      }
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      try {
        const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } catch (error) {
        console.error("Error skipping forward:", error);
      }
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      try {
        const newTime = Math.max(0, audioRef.current.currentTime - 15);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      } catch (error) {
        console.error("Error skipping backward:", error);
      }
    }
  };
  
  const saveProgress = async (completed = false) => {
    if (!audioRef.current || !podcastId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const userId = session.user.id;
      const last_position = Math.floor(audioRef.current.currentTime);
      
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
