
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import type { QuizQuestion } from "@/models/Quiz";

interface PodcastData {
  id: string;
  title: string;
  description?: string;
  duration: number;
  audio_url: string;
  image_url?: string | null;
  course_id: string;
  courseName?: string; // Add courseName directly to PodcastData
  courses?: {
    id: string;
    title: string;
  } | {
    id: string;
    title: string;
  }[];
}

interface UsePodcastPlayerReturn {
  podcast: PodcastData | null;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  quizQuestions: QuizQuestion[];
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (value: number) => void;
  onTimeUpdate: (time: number) => void;
  // Add these properties to match what's used in PodcastPlayer.tsx
  loading: boolean;
  showXPModal: boolean;
  showQuiz: boolean;
  togglePlay: () => void;
  handleVolumeChange: (value: number) => void;
  toggleQuiz: () => void;
  setShowQuiz: (show: boolean) => void;
  skipForward: () => void;
  skipBackward: () => void;
}

export const usePodcastPlayer = (podcastId: string | undefined): UsePodcastPlayerReturn => {
  const [podcast, setPodcast] = useState<PodcastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8); // Default volume
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  // Add state for XP modal and quiz
  const [showXPModal, setShowXPModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Function to fetch podcast data
  const fetchPodcast = useCallback(async () => {
    if (!podcastId) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Fetching podcast with ID:", podcastId);
      
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcasts')
        .select('id, title, description, duration, audio_url, image_url, course_id, courses(id, title)')
        .eq('id', podcastId)
        .single();
      
      if (podcastError) {
        console.error("Error fetching podcast:", podcastError);
        setError(`Failed to load podcast: ${podcastError.message}`);
        setIsLoading(false);
        return;
      }
      
      if (!podcastData) {
        setError("Podcast not found");
        setIsLoading(false);
        return;
      }
      
      console.log("Podcast data fetched:", podcastData);
      
      // Determine course name from the courses data
      let courseName = "Unknown Course";
      if (podcastData.courses) {
        if (Array.isArray(podcastData.courses) && podcastData.courses.length > 0) {
          // If it's an array, take the first element's title
          courseName = podcastData.courses[0].title || "Unknown Course";
        } else if (typeof podcastData.courses === 'object' && podcastData.courses !== null) {
          // If it's a single object with a title property
          courseName = (podcastData.courses as { title: string }).title || "Unknown Course";
        }
      }
      
      // Create a new podcast object with the courseName included
      const processedPodcast: PodcastData = {
        ...podcastData,
        courseName: courseName
      };
      
      // Fetch quiz questions for this podcast
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('podcast_id', podcastId);
      
      if (quizError) {
        console.error("Error fetching quiz questions:", quizError);
      } else {
        setQuizQuestions(quizData || []);
      }
      
      setPodcast(processedPodcast);
    } catch (err: any) {
      console.error("Unexpected error in fetchPodcast:", err);
      setError(err.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: "Failed to load podcast",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [podcastId, toast]);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [volume]);
  
  // Load audio when podcast changes
  useEffect(() => {
    if (podcast && audioRef.current) {
      audioRef.current.src = podcast.audio_url;
      audioRef.current.load();
      
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [podcast]);
  
  // Fetch podcast when ID changes
  useEffect(() => {
    fetchPodcast();
  }, [fetchPodcast]);
  
  // Play/pause toggle
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(err => {
          console.error("Error playing audio:", err);
          toast({
            title: "Playback Error",
            description: "Could not play the podcast. Please try again.",
            variant: "destructive"
          });
        });
    }
    
    setIsPlaying(!isPlaying);
  }, [isPlaying, toast]);
  
  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);
  
  // Update volume
  const setVolume = useCallback((value: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.volume = value;
    setVolumeState(value);
  }, []);
  
  // Update time
  const onTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);
  
  // Skip forward function
  const skipForward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    seekTo(newTime);
  }, [seekTo]);
  
  // Skip backward function
  const skipBackward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.max(audioRef.current.currentTime - 10, 0);
    seekTo(newTime);
  }, [seekTo]);
  
  // Toggle quiz visibility
  const toggleQuiz = useCallback(() => {
    setShowQuiz(prev => !prev);
  }, []);
  
  // Alias for togglePlayPause to match what's used in PodcastPlayer.tsx
  const togglePlay = togglePlayPause;
  
  // Alias for setVolume to match what's used in PodcastPlayer.tsx
  const handleVolumeChange = setVolume;
  
  return {
    podcast,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error,
    duration,
    currentTime,
    isPlaying,
    volume,
    quizQuestions,
    togglePlayPause,
    togglePlay, // Alias
    seekTo,
    setVolume,
    handleVolumeChange, // Alias
    onTimeUpdate,
    showXPModal,
    showQuiz,
    toggleQuiz,
    setShowQuiz,
    skipForward,
    skipBackward
  };
};
