
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Play, Pause, SkipBack, SkipForward, Volume2, Award, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  duration: number;
  course_id: string;
  course: {
    title: string;
    subject: string;
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PodcastPlayer = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<{
    id?: string;
    completed: boolean;
    last_position: number;
  }>({
    completed: false,
    last_position: 0
  });

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        if (!podcastId) return;
        
        // First get the podcast details
        const { data: podcastData, error: podcastError } = await supabase
          .from('podcasts')
          .select(`
            *,
            course:course_id(
              title,
              subject
            )
          `)
          .eq('id', podcastId)
          .single();
          
        if (podcastError) {
          console.error('Error fetching podcast:', podcastError);
          toast({
            title: "Error",
            description: "Could not find podcast",
            variant: "destructive"
          });
          return;
        }
        
        setPodcast(podcastData);
        
        // Then fetch user progress if logged in
        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('podcast_id', podcastId)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!progressError && progressData) {
            setProgress({
              id: progressData.id,
              completed: progressData.completed,
              last_position: progressData.last_position || 0
            });
            
            // Set initial position from saved progress
            if (progressData.last_position && audioRef.current) {
              audioRef.current.currentTime = progressData.last_position;
              setCurrentTime(progressData.last_position);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load podcast",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPodcast();
  }, [podcastId, user, toast]);
  
  // Save progress periodically
  useEffect(() => {
    if (!user || !podcast) return;
    
    const saveProgressInterval = setInterval(async () => {
      if (currentTime > 0) {
        try {
          const isCompleted = currentTime >= (duration * 0.9); // Mark as completed if 90% listened
          
          if (progress.id) {
            // Update existing progress
            await supabase
              .from('user_progress')
              .update({
                last_position: Math.floor(currentTime),
                completed: isCompleted || progress.completed,
                updated_at: new Date().toISOString()
              })
              .eq('id', progress.id);
          } else {
            // Create new progress entry
            const { data } = await supabase
              .from('user_progress')
              .insert({
                user_id: user.id,
                podcast_id: podcast.id,
                course_id: podcast.course_id,
                last_position: Math.floor(currentTime),
                completed: isCompleted
              })
              .select('id')
              .single();
              
            if (data) {
              setProgress(prev => ({
                ...prev,
                id: data.id
              }));
            }
          }
          
          // Update local state if needed
          if (isCompleted && !progress.completed) {
            setProgress(prev => ({
              ...prev,
              completed: true
            }));
          }
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(saveProgressInterval);
  }, [user, podcast, currentTime, duration, progress]);
  
  const handlePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };
  
  const handleSkipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const handleShare = async () => {
    if (navigator.share && podcast) {
      try {
        await navigator.share({
          title: podcast.title,
          text: `Check out this podcast: ${podcast.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Podcast link copied to clipboard",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!podcast) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center px-4 pt-16 text-center animate-fade-in">
          <div className="mb-8 h-40 w-40 rounded-full bg-gray-100 flex items-center justify-center">
            <Pause className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Podcast not found</h1>
          <p className="mb-8 text-gray-500">
            The podcast you're looking for might have been removed or is not available.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }
  
  // For the "Algebra Fundamentals" demo
  if (podcast.title === "Algebra Fundamentals" || podcastId === "algebra-fundamentals") {
    return (
      <Layout>
        <div className="animate-fade-in pb-24 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to course
          </button>
          
          <div className="relative mb-6 aspect-[3/1] overflow-hidden rounded-xl">
            <img 
              src={podcast.image_url || "https://source.unsplash.com/random/?math,algebra"} 
              alt={podcast.title} 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-start justify-end p-6">
              <div className="mb-2 flex space-x-2">
                <span className="badge bg-blue-100 text-blue-700">GCSE</span>
                <span className="badge bg-purple-100 text-purple-700">Mathematics</span>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Algebra Fundamentals</h1>
              <p className="text-lg text-white/80">Master the basics of algebraic expressions</p>
            </div>
          </div>
          
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="glass-card p-4 md:col-span-2">
              <h2 className="mb-4 text-xl font-bold">About this podcast</h2>
              <p className="mb-4 text-gray-700">
                This comprehensive introduction to algebra covers the fundamental concepts that form the backbone of higher mathematics. We explore variables, expressions, equations, and how to solve them step by step.
              </p>
              <p className="mb-4 text-gray-700">
                Perfect for GCSE students, this podcast explains how to work with algebraic expressions, simplify terms, and use the essential rules that will help you succeed in your exams.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Difficulty</p>
                    <p className="font-medium">Beginner</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="font-medium">4.8/5</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-card flex flex-col p-4">
              <h2 className="mb-4 text-xl font-bold">Topics covered</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-700">1</span>
                  </div>
                  <span>Introduction to variables</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-700">2</span>
                  </div>
                  <span>Working with expressions</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-700">3</span>
                  </div>
                  <span>Solving simple equations</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-700">4</span>
                  </div>
                  <span>Order of operations</span>
                </li>
                <li className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xs text-green-700">5</span>
                  </div>
                  <span>Word problems with algebra</span>
                </li>
              </ul>
              <div className="mt-auto pt-4">
                <Button
                  className="w-full"
                  onClick={handlePlay}
                >
                  {playing ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> Start Listening
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-white p-4 shadow-lg">
            <div className="mx-auto max-w-7xl">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-primary/10 mr-3 flex-shrink-0 flex items-center justify-center">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium leading-tight">Algebra Fundamentals</p>
                    <p className="text-xs text-gray-500">Mathematics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-10">
                  {formatTime(duration)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
                  onClick={handleSkipBackward}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  className="h-12 w-12 rounded-full p-0"
                  onClick={handlePlay}
                >
                  {playing ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full p-0"
                  onClick={handleSkipForward}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={podcast.audio_url || "https://filesamples.com/samples/audio/mp3/sample4.mp3"}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setPlaying(false)}
              onError={(e) => console.error("Audio error:", e)}
              className="hidden"
            />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Regular podcast display
  return (
    <Layout>
      <div className="pb-24 pt-4">
        {/* Regular podcast player UI here */}
        <p>Regular podcast player for {podcast.title}</p>
      </div>
    </Layout>
  );
};

export default PodcastPlayer;
