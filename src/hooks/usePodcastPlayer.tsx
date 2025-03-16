
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
  const [volume, setVolume] = useState(1);
  const [isQuizAvailable, setIsQuizAvailable] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fetch podcast data
  useEffect(() => {
    async function fetchPodcastData() {
      if (!podcastId) return;
      
      try {
        // Fetch podcast data
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('id', podcastId)
          .single();
        
        if (podcastError) throw podcastError;
        if (!podcastData) throw new Error('Podcast not found');
        
        // Set podcast data
        setPodcastData(podcastData);
        
        // Fetch course data
        if (podcastData.course_id) {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, title, image_url')
            .eq('id', podcastData.course_id)
            .maybeSingle();
          
          if (courseError) {
            console.error("Error fetching course:", courseError);
          } else if (courseData) {
            // Convert the course data to the expected format
            const formattedCourseData: CourseData = {
              id: courseData.id,
              title: courseData.title,
              image: courseData.image_url
            };
            setCourseData(formattedCourseData);
          }
        }
        
        // Check if quiz is available
        const { count, error: quizError } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('podcast_id', podcastId);
        
        if (quizError) {
          console.error("Error checking quiz:", quizError);
        } else {
          setIsQuizAvailable(!!count && count > 0);
        }
        
        // Get user progress if logged in
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
        
      } catch (error: any) {
        console.error("Error fetching podcast:", error);
        setError(error.message || "Failed to load podcast");
        toast({
          title: "Error",
          description: "Failed to load podcast",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchPodcastData();
  }, [podcastId, toast]);
  
  // Handle found progress data
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0) {
      setCurrentTime(progressData.last_position);
      if (audioRef.current) {
        audioRef.current.currentTime = progressData.last_position;
      }
    }
  };
  
  // Audio control functions
  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const changeVolume = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };
  
  const skipForward = () => {
    if (audioRef.current) {
      const newTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - 15);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Save progress to the database
  const saveProgress = async (completed = false) => {
    if (!audioRef.current || !podcastId) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    const userId = session.user.id;
    const last_position = Math.floor(audioRef.current.currentTime);
    
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
      }
    } catch (error) {
      console.error("Exception saving progress:", error);
    }
  };
  
  // Save progress every 10 seconds
  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (isPlaying) {
        saveProgress();
      }
    }, 10000);
    
    return () => clearInterval(progressInterval);
  }, [isPlaying, podcastId]);
  
  // Handle completion
  const handleCompletion = async () => {
    await saveProgress(true);
    setShowXPModal(true);
  };
  
  // Expose everything we need
  return {
    podcastData,
    courseData,
    loading,
    error,
    ready,
    setReady,
    isPlaying,
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
