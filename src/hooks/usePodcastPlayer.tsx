
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { QuizQuestion } from "@/components/QuizModal";

interface Podcast {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  description: string;
  duration: number;
  image?: string;
  audioUrl?: string;
  quiz?: QuizQuestion[];
}

export const usePodcastPlayer = (podcastId?: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showXPModal, setShowXPModal] = useState(false);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Fetch podcast data from Supabase
  useEffect(() => {
    const fetchPodcast = async () => {
      if (!podcastId) return;
      
      console.log("Fetching podcast with ID:", podcastId);
      
      try {
        // Fetch podcast data
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            id,
            title,
            description,
            duration,
            audio_url,
            image_url,
            course_id,
            courses (
              title
            )
          `)
          .eq('id', podcastId)
          .single();
        
        if (podcastError) {
          console.error("Error fetching podcast:", podcastError);
          setLoading(false);
          return;
        }
        
        if (!podcastData) {
          console.log("No podcast found with ID:", podcastId);
          setLoading(false);
          return;
        }
        
        console.log("Podcast data fetched:", podcastData);
        
        // Fetch quiz questions for this podcast
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('podcast_id', podcastId);
        
        if (quizError) {
          console.error("Error fetching quiz questions:", quizError);
        }
        
        // Transform quiz data to match the expected format
        const formattedQuizQuestions: QuizQuestion[] = (quizData || []).map((question) => ({
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correct_option
        }));
        
        // Fixed the type error by accessing title property from the first element of the courses array
        const courseTitle = 
          Array.isArray(podcastData.courses) && podcastData.courses.length > 0
            ? podcastData.courses[0].title
            : "Unknown Course";

        // Format the podcast data to match what the component expects
        const formattedPodcast = {
          id: podcastData.id,
          title: podcastData.title,
          courseId: podcastData.course_id,
          courseName: courseTitle,
          description: podcastData.description || "No description available",
          duration: podcastData.duration || 0,
          image: podcastData.image_url,
          quiz: formattedQuizQuestions,
          audioUrl: podcastData.audio_url
        };
        
        setPodcast(formattedPodcast);
        setQuizQuestions(formattedQuizQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching podcast data:", error);
        setLoading(false);
      }
    };
    
    fetchPodcast();
  }, [podcastId]);
  
  // Initialize audio element
  useEffect(() => {
    if (podcast?.audioUrl && !audioRef.current) {
      audioRef.current = new Audio(podcast.audioUrl);
      audioRef.current.volume = volume / 100;
      
      // Add event listeners
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [podcast?.audioUrl]);
  
  // Handle time update event
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Show XP modal at certain points
      if (Math.floor(audioRef.current.currentTime) === 20) {
        setShowXPModal(true);
        setTimeout(() => setShowXPModal(false), 3000);
      }
    }
  };
  
  // Handle ended event
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  // Toggle quiz display
  const toggleQuiz = () => setShowQuiz(!showQuiz);
  
  // Skip forward/backward functions
  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    }
  };
  
  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };
  
  // Seek to a specific time
  const seekTo = (timePercent: number) => {
    if (audioRef.current && podcast) {
      const seekTime = (timePercent / 100) * podcast.duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };
  
  return {
    podcast,
    loading,
    isPlaying,
    currentTime,
    volume,
    showXPModal,
    quizQuestions,
    showQuiz,
    togglePlay,
    handleVolumeChange,
    toggleQuiz,
    setShowQuiz,
    skipForward,
    skipBackward,
    seekTo
  };
};
