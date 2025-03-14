
import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Play, BookOpen, Clock, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import PodcastCard from "@/components/PodcastCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

// Mock data
const coursesData = {
  "math-gcse": {
    id: "math-gcse",
    title: "Mathematics GCSE",
    subject: "math" as const,
    description: "Master key mathematical concepts and prepare for your GCSE exams with our comprehensive audio lessons.",
    totalPodcasts: 12,
    completedPodcasts: 5,
    totalDuration: 540, // in minutes
    difficulty: "Intermediate",
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
    podcasts: [
      {
        id: "math-algebra-1",
        title: "Algebra Fundamentals",
        courseId: "math-gcse",
        courseName: "Mathematics GCSE",
        duration: 840,
        progress: 65,
        completed: false,
        image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
      },
      {
        id: "math-geometry-1",
        title: "Geometry Basics",
        courseId: "math-gcse",
        courseName: "Mathematics GCSE",
        duration: 760,
        progress: 100,
        completed: true,
        image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
      },
      {
        id: "math-trigonometry-1",
        title: "Introduction to Trigonometry",
        courseId: "math-gcse",
        courseName: "Mathematics GCSE",
        duration: 920,
        progress: 0,
        completed: false,
        image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
      }
    ]
  },
  "english-gcse": {
    id: "english-gcse",
    title: "English GCSE",
    subject: "english" as const,
    description: "Improve your English language and literature skills with our engaging audio lessons designed for GCSE success.",
    totalPodcasts: 10,
    completedPodcasts: 2,
    totalDuration: 450, // in minutes
    difficulty: "Intermediate",
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png",
    podcasts: [
      {
        id: "english-shakespeare-1",
        title: "Introduction to Shakespeare",
        courseId: "english-gcse",
        courseName: "English GCSE",
        duration: 720,
        progress: 0,
        completed: false,
        image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
      },
      {
        id: "english-poetry-1",
        title: "Poetry Analysis Techniques",
        courseId: "english-gcse",
        courseName: "English GCSE",
        duration: 680,
        progress: 100,
        completed: true,
        image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
      }
    ]
  }
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courseId ? coursesData[courseId as keyof typeof coursesData] : null;
  
  if (!course) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-500 mb-6">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const completionPercentage = Math.round((course.completedPodcasts / course.totalPodcasts) * 100);
  const subjectGradient = course.subject === "math" ? "bg-math-gradient" : 
                         course.subject === "english" ? "bg-english-gradient" : 
                         "bg-science-gradient";
  
  return (
    <Layout>
      <div className="space-y-6 pb-4 animate-slide-up">
        {/* Header with back button */}
        <div className="flex items-center space-x-2 pt-4">
          <Link 
            to="/courses"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="font-display font-bold text-xl text-gray-900">
            Course Details
          </h1>
        </div>
        
        {/* Course Hero Section */}
        <div className={`rounded-xl overflow-hidden relative ${subjectGradient}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10 p-6 flex flex-col justify-end">
            <h2 className="font-display font-bold text-2xl text-white mb-1">
              {course.title}
            </h2>
            <p className="text-white/90 text-sm mb-4">
              {course.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="text-white text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
                {course.difficulty}
              </div>
              <div className="flex items-center text-white text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m
              </div>
            </div>
          </div>
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-48 object-cover"
          />
        </div>
        
        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Your Progress</h3>
            <span className="text-sm text-gray-500">
              {course.completedPodcasts}/{course.totalPodcasts} completed
            </span>
          </div>
          <ProgressBar 
            value={completionPercentage}
            color={course.subject === "math" ? "bg-math-gradient" : 
                  course.subject === "english" ? "bg-english-gradient" : 
                  "bg-science-gradient"}
          />
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="episodes">
              <Play className="w-4 h-4 mr-2" />
              Episodes
            </TabsTrigger>
            <TabsTrigger value="about">
              <BookOpen className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes" className="space-y-4 pt-4">
            {course.podcasts.map((podcast) => (
              <PodcastCard 
                key={podcast.id}
                {...podcast}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="about" className="pt-4">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Course Description</h3>
                <p className="text-gray-600 text-sm">
                  {course.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What You'll Learn</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-primary">•</div>
                    <p>Master key concepts and techniques</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-primary">•</div>
                    <p>Practice with exam-style questions</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 text-primary">•</div>
                    <p>Build confidence for your GCSE exams</p>
                  </li>
                </ul>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <h4 className="font-medium text-sm">Difficulty Level</h4>
                    <p className="text-xs text-gray-500">{course.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <h4 className="font-medium text-sm">Total Duration</h4>
                    <p className="text-xs text-gray-500">{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CourseDetail;
