
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Headphones } from "lucide-react";
import PodcastHeader from "./PodcastHeader";
import PodcastCover from "./PodcastCover";
import PodcastInfo from "./PodcastInfo";
import AudioProgress from "./AudioProgress";
import PlayerControls from "./PlayerControls";
import VolumeControl from "./VolumeControl";
import PodcastDescription from "./PodcastDescription";
import QuizButton from "./QuizButton";
import PodcastAudio from "./PodcastAudio";
import PodcastAudioEvents from "./PodcastAudioEvents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PodcastData, CourseData } from "@/types/podcast";
import { useAudioStore } from "@/lib/audioContext";

interface PodcastPlayerContentProps {
  podcastData: PodcastData;
  courseData: CourseData | null;
  ready: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isQuizAvailable: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  seek: (percent: number) => void;
  changeVolume: (volume: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  handleAudioLoadedMetadata: () => void;
  handleAudioTimeUpdate: () => void;
  handleAudioEnded: () => void;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioError: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
}

const PodcastPlayerContent = ({
  podcastData,
  courseData,
  ready,
  isPlaying,
  currentTime,
  duration,
  volume,
  isQuizAvailable,
  audioRef,
  togglePlayPause,
  seek,
  changeVolume,
  skipForward,
  skipBackward,
  handleAudioLoadedMetadata,
  handleAudioTimeUpdate,
  handleAudioEnded,
  handleAudioPlay,
  handleAudioPause,
  handleAudioError
}: PodcastPlayerContentProps) => {
  // Determine the image to use for the podcast cover
  // If podcast has an image, use it. If not, use the course image instead of default gradient
  const coverImage = podcastData.image_url || (courseData?.image || "");
  
  // Register podcast with global audio store to enable mini player
  const audioStore = useAudioStore();
  
  useEffect(() => {
    if (audioRef.current && podcastData) {
      // Set podcast metadata in the global store to enable mini player display
      audioStore.setPodcastMeta({
        id: podcastData.id,
        title: podcastData.title,
        courseName: courseData?.title || "Course",
        image: coverImage
      });
    }
  }, [podcastData, courseData, audioRef, audioStore, coverImage]);
  
  return (
    <div className="flex flex-col space-y-6 max-w-md mx-auto pb-6">
      {/* Back button and course name */}
      <div className="flex items-center justify-between mb-2">
        <Link to={`/course/${podcastData.course_id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="text-sm font-medium text-gray-500">
          {courseData?.title || "Course"}
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Main content card with shadow and rounded corners */}
      <Card className="overflow-hidden bg-white shadow-lg rounded-3xl p-6 border-none">
        {/* Podcast cover art - larger and more prominent */}
        <PodcastCover 
          image={coverImage} 
          title={podcastData.title}
        />
        
        {/* Podcast info (title, course) */}
        <PodcastInfo 
          title={podcastData.title} 
          courseName={courseData?.title || "Course"} 
        />
        
        {/* Audio player controls - Modern look */}
        <div className="space-y-6 mt-6">
          <AudioProgress 
            currentTime={currentTime} 
            duration={duration} 
            onSeek={seek}
          />
          
          <PlayerControls 
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
          />
          
          <VolumeControl 
            volume={volume} 
            onVolumeChange={changeVolume} 
          />
        </div>
      </Card>
      
      {/* About this episode section - Clean card look */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-3xl p-5 border-none">
        <PodcastDescription description={podcastData.description || "Learn more about this topic."} />
      </Card>
      
      {/* Audio element with event handlers - Make sure it stays active even when component unmounts */}
      <PodcastAudioEvents
        handleAudioLoadedMetadata={handleAudioLoadedMetadata}
        handleAudioTimeUpdate={handleAudioTimeUpdate}
        handleAudioEnded={handleAudioEnded}
        handleAudioPlay={handleAudioPlay}
        handleAudioPause={handleAudioPause}
        handleAudioError={handleAudioError}
        audioRef={audioRef}
      >
        <PodcastAudio 
          audioRef={audioRef}
          src={podcastData.audio_url}
        />
      </PodcastAudioEvents>
      
      {/* Quiz button if available - Attractive floating button */}
      {isQuizAvailable && (
        <QuizButton onClick={() => window.location.href = `/quiz/${podcastData.id}`} />
      )}
    </div>
  );
};

export default PodcastPlayerContent;
