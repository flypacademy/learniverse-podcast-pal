
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Award } from "lucide-react";
import Clock from "@/components/Clock";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Mock podcast data
const podcastData = {
  "podcast-1": {
    id: "podcast-1",
    title: "Algebra Fundamentals",
    description: "This podcast covers the core concepts of algebra, including equations, polynomials, and factoring. Perfect for GCSE Math students preparing for their exams.",
    courseId: "math-gcse",
    courseName: "Mathematics",
    exam: "GCSE",
    board: "AQA",
    duration: 540, // 9 minutes
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
    transcriptSections: [
      { time: 0, text: "Welcome to our podcast on Algebra Fundamentals. Today we'll be covering the core concepts that you need to know for your GCSE mathematics exam." },
      { time: 60, text: "Let's start with the basics of algebraic expressions. An expression is a mathematical phrase that combines numbers, variables, and operations." },
      { time: 120, text: "For example, 3x + 5y - 2 is an algebraic expression with two variables: x and y." },
      { time: 180, text: "Now let's talk about solving linear equations. The key principle is to isolate the variable on one side of the equation." },
      { time: 240, text: "Remember that whatever operation you perform on one side of the equation, you must do the same to the other side." }
    ],
    quiz: [
      {
        question: "Which of the following is a linear equation?",
        options: ["y = x²", "y = x + 5", "y = 1/x", "y = e^x"],
        correctOption: 1
      },
      {
        question: "If 2x + 5 = 15, what is the value of x?",
        options: ["5", "7.5", "5.5", "10"],
        correctOption: 0
      },
      {
        question: "What is the coefficient of x in the expression 3x + 5y - 2?",
        options: ["2", "3", "5", "x"],
        correctOption: 1
      }
    ]
  },
  "podcast-2": {
    id: "podcast-2",
    title: "Shakespeare Analysis",
    description: "Dive into the world of Shakespeare with this comprehensive analysis of his most famous plays and sonnets. This podcast focuses on the key themes and literary devices used in his work.",
    courseId: "english-gcse",
    courseName: "English Literature",
    exam: "GCSE",
    board: "Edexcel",
    duration: 720, // 12 minutes
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png",
    transcriptSections: [
      { time: 0, text: "Welcome to our podcast on Shakespeare's works. Today we'll explore the themes and literary devices in his most famous plays." },
      { time: 60, text: "Let's begin with 'Romeo and Juliet', one of Shakespeare's most beloved tragedies about young, star-crossed lovers." },
      { time: 120, text: "The theme of fate versus free will is central to this play. Do the characters have control over their destinies, or are they at the mercy of fate?" },
      { time: 180, text: "Shakespeare uses dramatic irony extensively throughout the play. The audience knows that Romeo and Juliet will die, creating tension as events unfold." },
      { time: 240, text: "The use of sonnets within the dialogue is another important aspect of Shakespeare's writing style in this play." }
    ],
    quiz: [
      {
        question: "Which of these is NOT a theme in Romeo and Juliet?",
        options: ["Love", "Fate", "Conflict", "Colonialism"],
        correctOption: 3
      },
      {
        question: "What literary device is used when the audience knows something the characters don't?",
        options: ["Metaphor", "Dramatic irony", "Alliteration", "Personification"],
        correctOption: 1
      },
      {
        question: "In which city is Romeo and Juliet set?",
        options: ["Venice", "Rome", "Verona", "Florence"],
        correctOption: 2
      }
    ]
  }
};

const PodcastSample = () => {
  const { podcastId } = useParams<{ podcastId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  const { toast } = useToast();
  
  const podcast = podcastData[podcastId as keyof typeof podcastData];
  
  // If podcast not found, return placeholder
  if (!podcast) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Podcast Not Found</h1>
        <Link to="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }
  
  useEffect(() => {
    // Simulate playback progress with a timer
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= podcast.duration) {
            setIsPlaying(false);
            setShowQuiz(true);
            return podcast.duration;
          }
          return prev + 1;
        });
        
        // Add XP for listening (10 XP per minute = 1/6 XP per second)
        setEarnedXP(prev => prev + (1/6));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isPlaying, podcast.duration]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      toast({
        title: "Podcast playing",
        description: `You'll earn 10 XP for every minute you listen`,
      });
    }
  };
  
  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getProgress = () => {
    return (currentTime / podcast.duration) * 100;
  };
  
  // Find the current transcript section based on playback time
  const getCurrentTranscriptIndex = () => {
    for (let i = podcast.transcriptSections.length - 1; i >= 0; i--) {
      if (currentTime >= podcast.transcriptSections[i].time) {
        return i;
      }
    }
    return 0;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <Link to="/" className="flex items-center text-gray-700 hover:text-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Podcast info and controls - Left column */}
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-xl overflow-hidden shadow-md relative">
              <img 
                src={podcast.image || "/placeholder.svg"} 
                alt={podcast.title} 
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <div className="flex space-x-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100/90 text-blue-700 rounded-full backdrop-blur-sm">
                      {podcast.exam}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100/90 text-purple-700 rounded-full backdrop-blur-sm">
                      {podcast.board}
                    </span>
                  </div>
                  <h1 className="text-white font-semibold text-xl">{podcast.title}</h1>
                  <p className="text-white/80 text-sm">{podcast.courseName}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
                <span className="text-sm text-gray-500">{formatTime(podcast.duration)}</span>
              </div>
              
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={podcast.duration}
                  step={1}
                  onValueChange={handleSeek}
                />
              </div>
              
              <div className="flex justify-center space-x-4 mb-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="h-12 w-12 rounded-full"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setCurrentTime(Math.min(podcast.duration, currentTime + 10))}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <Slider
                  value={[volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm space-y-2">
              <h3 className="font-semibold">XP Earned</h3>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{Math.floor(earnedXP)} XP</p>
                  <p className="text-xs text-gray-500">Keep listening to earn more!</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transcript and Quiz - Right column */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="quiz" disabled={!showQuiz}>Quiz</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transcript" className="mt-4">
                <div className="bg-white rounded-lg p-5 shadow-sm space-y-4">
                  <h2 className="font-semibold text-lg border-b pb-2">{podcast.title} - Transcript</h2>
                  
                  <div className="space-y-5">
                    {podcast.transcriptSections.map((section, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded ${getCurrentTranscriptIndex() === index ? 'bg-primary/10 border-l-4 border-primary' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{formatTime(section.time)}</span>
                        </div>
                        <p>{section.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="quiz" className="mt-4">
                <div className="bg-white rounded-lg p-5 shadow-sm">
                  <h2 className="font-semibold text-lg border-b pb-2 mb-4">Knowledge Check</h2>
                  
                  <div className="space-y-6">
                    {podcast.quiz.map((quizItem, qIndex) => (
                      <div key={qIndex} className="space-y-3">
                        <h3 className="font-medium">Question {qIndex + 1}: {quizItem.question}</h3>
                        
                        <div className="space-y-2">
                          {quizItem.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                oIndex === quizItem.correctOption ? 'border-green-500 bg-green-50' : 'border-gray-200'
                              }`}
                            >
                              {option}
                              {oIndex === quizItem.correctOption && (
                                <span className="ml-2 text-green-500 text-sm font-medium">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6">
                      <Button className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Complete and Earn 50 XP
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 bg-white rounded-lg p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-3">About this Podcast</h2>
              <p className="text-gray-700">{podcast.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastSample;
