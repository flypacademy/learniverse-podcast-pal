
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import PodcastHeader from "@/components/podcast/PodcastHeader";
import PodcastCover from "@/components/podcast/PodcastCover";
import PodcastInfo from "@/components/podcast/PodcastInfo";
import PlayerControls from "@/components/podcast/PlayerControls";
import AudioProgress from "@/components/podcast/AudioProgress";
import VolumeControl from "@/components/podcast/VolumeControl";
import XPModal from "@/components/podcast/XPModal";
import QuizButton from "@/components/podcast/QuizButton";
import PodcastDescription from "@/components/podcast/PodcastDescription";
import { useAudioContext } from "@/hooks/useAudioContext";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  duration: number;
  course_id: string;
}

const PodcastPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showXPModal, setShowXPModal] = useState(false);
  const [courseName, setCourseName] = useState(""); // Add state for course name
  
  const {
    audioRef,
    currentPodcastId,
    setCurrentPodcastId,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    handleVolumeChange,
    handleSeek,
    skipForward,
    skipBackward,
    loadAudio
  } = useAudioContext();
  
  useEffect(() => {
    const fetchPodcast = async () => {
      if (!id) return;
      
      try {
        console.log("Fetching podcast:", id);
        setLoading(true);
        
        const { data, error } = await supabase
          .from('podcasts')
          .select('*, courses:course_id(name)')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error fetching podcast:", error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        console.log("Podcast data fetched:", data);
        setPodcast(data);
        
        // Set course name if available in the joined data
        if (data.courses && data.courses.name) {
          setCourseName(data.courses.name);
        } else {
          // Fetch course name separately if not available in join
          const courseResponse = await supabase
            .from('courses')
            .select('name')
            .eq('id', data.course_id)
            .single();
          
          if (!courseResponse.error && courseResponse.data) {
            setCourseName(courseResponse.data.name);
          }
        }
        
        // Set as current podcast and load audio if it's a different podcast
        if (currentPodcastId !== id) {
          setCurrentPodcastId(id);
          loadAudio(data.audio_url);
        }
        
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError(err.message || "Failed to load podcast");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPodcast();
  }, [id, currentPodcastId, setCurrentPodcastId, loadAudio]);
  
  const handleBackClick = () => {
    if (podcast?.course_id) {
      navigate(`/course/${podcast.course_id}`);
    } else {
      navigate("/courses");
    }
  };
  
  const handleQuizComplete = () => {
    setShowXPModal(true);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4 bg-gray-900">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !podcast) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center text-center bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4">Error Loading Podcast</h2>
        <p className="text-gray-400 mb-6">{error || "Podcast not found"}</p>
        <Button onClick={() => navigate("/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container max-w-3xl mx-auto px-4 pb-24 pt-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 hover:bg-gray-800"
          onClick={handleBackClick}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Course
        </Button>
        
        <div className="space-y-8">
          <PodcastHeader courseName={courseName} title={podcast.title} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <PodcastCover 
                imageUrl={podcast.image_url || "/placeholder.svg"} 
                alt={podcast.title} 
              />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <PodcastInfo 
                title={podcast.title}
                duration={podcast.duration}
              />
              
              <AudioProgress 
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
              
              <PlayerControls 
                isPlaying={isPlaying} 
                onPlayPause={togglePlayPause}
                onSkipBack={skipBackward}
                onSkipForward={skipForward}
              />
              
              <VolumeControl 
                volume={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
          
          <div className="space-y-6 mt-8">
            <PodcastDescription description={podcast.description} />
            
            <QuizButton onClick={() => handleQuizComplete()} />
          </div>
        </div>
      </div>
      
      <XPModal 
        isOpen={showXPModal} 
        onClose={() => setShowXPModal(false)}
        xpEarned={50}
      />
    </div>
  );
};

export default PodcastPlayer;
