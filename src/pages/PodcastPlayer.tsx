
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/pages/admin/podcasts/utils/formatters";
import { usePodcastData } from "@/hooks/usePodcastData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { toast } from "sonner";
import { XPReason } from "@/types/xp";
import XPModal from "@/components/podcast/XPModal";

const PodcastPlayer = () => {
  const [showXPModal, setShowXPModal] = useState(false);
  const [initialPositionSet, setInitialPositionSet] = useState(false);
  
  // Get podcast data
  const { 
    podcastId, 
    podcastData, 
    courseData, 
    loading, 
    error, 
    isQuizAvailable 
  } = usePodcastData();
  
  // Initialize audio player
  const {
    isLoading: audioLoading,
    isPlaying,
    duration,
    currentTime,
    volume,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    changeVolume,
    setCurrentTime
  } = useAudioPlayer(podcastData?.audio_url);
  
  // Initialize progress tracking
  const {
    saveProgress,
    handleCompletion,
    loadProgress
  } = useProgressTracking(
    podcastId,
    audioRef.current,
    isPlaying,
    duration,
    currentTime,
    podcastData?.course_id
  );
  
  // Load saved progress when podcast data loads
  useEffect(() => {
    async function restoreProgress() {
      if (podcastData && !initialPositionSet) {
        try {
          const savedProgress = await loadProgress();
          
          if (savedProgress && savedProgress.last_position > 0 && audioRef.current) {
            console.log("Restoring saved position:", savedProgress.last_position);
            audioRef.current.currentTime = savedProgress.last_position;
            setCurrentTime(savedProgress.last_position);
          }
          
          setInitialPositionSet(true);
        } catch (err) {
          console.error("Error loading saved progress:", err);
        }
      }
    }
    
    restoreProgress();
  }, [podcastData, audioRef.current, initialPositionSet]);
  
  // Handle audio ended event
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = async () => {
        console.log("Audio ended, handling completion");
        const success = await handleCompletion();
        if (success) {
          setShowXPModal(true);
          setTimeout(() => setShowXPModal(false), 5000);
        }
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioRef.current, handleCompletion]);
  
  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-8 min-h-[50vh]">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  if (loading || !podcastData) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link to="/courses">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <Card className="p-8 flex flex-col items-center">
            <div className="w-48 h-48 rounded-2xl bg-gray-200 animate-pulse mb-6"></div>
            <div className="w-3/4 h-6 bg-gray-200 animate-pulse mb-3"></div>
            <div className="w-1/2 h-4 bg-gray-200 animate-pulse mb-8"></div>
            <div className="w-full h-4 bg-gray-200 animate-pulse mb-6"></div>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Get cover image
  const coverImage = podcastData.image_url || courseData?.image || "";
  
  return (
    <Layout>
      <div className="flex flex-col space-y-6 max-w-md mx-auto pb-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link to={podcastData.course_id ? `/course/${podcastData.course_id}` : "/courses"}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-sm font-medium text-gray-500">
            {courseData?.title || "Course"}
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
        
        {/* Main content card */}
        <Card className="overflow-hidden bg-white shadow-lg rounded-3xl p-6 border-none">
          {/* Podcast cover art */}
          <div className="aspect-square max-w-xs mx-auto relative mb-6">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl">
              {coverImage ? (
                <img 
                  src={coverImage} 
                  alt={podcastData.title} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl text-white">🎧</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Podcast info */}
          <div className="text-center space-y-2 mb-6">
            <h2 className="font-bold text-2xl text-gray-900 leading-tight">
              {podcastData.title}
            </h2>
            <p className="text-gray-500 font-medium text-sm">{courseData?.title || "Course"}</p>
          </div>
          
          {/* Audio player controls */}
          <div className="space-y-6 mt-6">
            {/* Progress slider */}
            <div className="space-y-2">
              <Slider 
                value={[progressPercent]} 
                min={0}
                max={100}
                step={0.1}
                onValueChange={(value) => seek(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
            
            {/* Play/pause buttons */}
            <div className="flex items-center justify-center gap-8">
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={skipBackward}
                aria-label="Skip back 15 seconds"
              >
                <SkipBack className="h-7 w-7" />
              </button>
              
              <button 
                onClick={togglePlayPause}
                className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={audioLoading}
              >
                {isPlaying ? 
                  <Pause className="h-7 w-7" /> : 
                  <Play className="h-7 w-7 ml-1" />
                }
              </button>
              
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={skipForward}
                aria-label="Skip forward 15 seconds"
              >
                <SkipForward className="h-7 w-7" />
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center gap-3 max-w-xs mx-auto">
              <div className="text-gray-500">
                {volume === 0 ? <VolumeX className="h-4 w-4" /> :
                 volume < 30 ? <Volume className="h-4 w-4" /> :
                 volume < 70 ? <Volume1 className="h-4 w-4" /> :
                 <Volume2 className="h-4 w-4" />}
              </div>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => changeVolume(value[0])}
                className="w-full"
              />
            </div>
          </div>
        </Card>
        
        {/* About this episode section */}
        <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-3xl p-5 border-none">
          <h3 className="font-bold text-lg mb-2">About this episode</h3>
          <p className="text-gray-700 text-sm">
            {podcastData.description || "Learn more about this topic."}
          </p>
        </Card>
        
        {/* Quiz button if available */}
        {isQuizAvailable && (
          <div className="mt-4 text-center">
            <Link to={`/quiz/${podcastData.id}`}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Take Quiz
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* XP Modal */}
      <XPModal 
        show={showXPModal}
        xpAmount={50}
        reason={XPReason.PODCAST_COMPLETION}
      />
    </Layout>
  );
};

export default PodcastPlayer;
