
import React from "react";
import { useParams } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import Layout from "@/components/Layout";
import QuizModal from "@/components/QuizModal";
import { useToast } from "@/components/ui/use-toast";

// Import custom components
import PodcastHeader from "@/components/podcast/PodcastHeader";
import PodcastCover from "@/components/podcast/PodcastCover";
import PodcastInfo from "@/components/podcast/PodcastInfo";
import PlayerControls from "@/components/podcast/PlayerControls";
import AudioProgress from "@/components/podcast/AudioProgress";
import VolumeControl from "@/components/podcast/VolumeControl";
import XPModal from "@/components/podcast/XPModal";
import QuizButton from "@/components/podcast/QuizButton";
import PodcastDescription from "@/components/podcast/PodcastDescription";

// Import custom hook
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";

const PodcastPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Use the custom hook for player state and logic
  const {
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
    setShowQuiz
  } = usePodcastPlayer(id);
  
  // Handle quiz completion
  const handleQuizComplete = (score: number) => {
    // Show toast with the quiz score
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}% on the ${podcast?.title} quiz.`,
    });
    
    // Add XP based on score
    const xpEarned = Math.floor(score / 10) * 5; // 5 XP per 10% score
    
    toast({
      title: `+${xpEarned} XP Earned!`,
      description: "Keep learning to earn more XP and level up.",
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <p>Loading podcast...</p>
        </div>
      </Layout>
    );
  }
  
  // Show not found state
  if (!podcast) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <p>Podcast not found</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-5 animate-slide-up">
        {/* Header with back button */}
        <PodcastHeader courseName={podcast.courseName} />
        
        {/* Podcast Image */}
        <PodcastCover image={podcast.image} title={podcast.title} />
        
        {/* Podcast Info */}
        <PodcastInfo title={podcast.title} courseName={podcast.courseName} />
        
        {/* Player Controls */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <AudioProgress currentTime={currentTime} duration={podcast.duration} />
          
          {/* Control Buttons */}
          <PlayerControls isPlaying={isPlaying} onPlayPause={togglePlay} />
          
          {/* Volume Control */}
          <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
        </div>
        
        {/* Quiz Button */}
        {quizQuestions.length > 0 && (
          <QuizButton onClick={toggleQuiz} />
        )}
        
        {/* Podcast Description */}
        <PodcastDescription 
          description={podcast.description} 
          audioUrl={podcast.audioUrl} 
        />
      </div>
      
      {/* XP Gained Modal */}
      <XPModal show={showXPModal} />
      
      {/* Quiz Modal */}
      {showQuiz && quizQuestions.length > 0 && (
        <QuizModal
          questions={quizQuestions}
          podcastTitle={podcast.title}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </Layout>
  );
};

export default PodcastPlayer;
