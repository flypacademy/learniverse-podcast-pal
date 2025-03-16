
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { QuizQuestion } from "@/components/QuizModal";
import { useAudioStore } from "@/lib/audioContext";

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
  const [showXPModal, setShowXPModal] = useState(false);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Get audio state from the global store
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentPodcastId,
    setAudio,
    play,
    pause,
    setCurrentTime,
    setVolume,
    setDuration
  } = useAudioStore();
  
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
        
        // Set duration for newly fetched podcast
        if (formattedPodcast.duration) {
          setDuration(formattedPodcast.duration);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching podcast data:", error);
        setLoading(false);
      }
    };
    
    fetchPodcast();
  }, [podcastId, setDuration]);
  
  // Initialize audio element when podcast changes
  useEffect(() => {
    if (podcast?.audioUrl && podcast.id) {
      // Check if we already have this podcast loaded
      if (currentPodcastId !== podcast.id) {
        const audio = new Audio(podcast.audioUrl);
        setAudio(audio, podcast.id);
      }
    }
    
    // Show XP modal at certain points
    if (currentTime === 20) {
      setShowXPModal(true);
      setTimeout(() => setShowXPModal(false), 3000);
    }
    
    // Cleanup on unmount is handled by the store
  }, [podcast, currentPodcastId, setAudio, currentTime]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  // Toggle quiz display
  const toggleQuiz = () => setShowQuiz(!showQuiz);
  
  // Skip forward/backward functions
  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
  };
  
  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
  };
  
  // Seek to a specific time
  const seekTo = (timePercent: number) => {
    if (duration) {
      const seekTime = (timePercent / 100) * duration;
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
