
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Play, BookOpen, Clock, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import PodcastCard from "@/components/PodcastCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Podcast {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number;
  progress: number;
  completed: boolean;
  image: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  totalPodcasts: number;
  completedPodcasts: number;
  totalDuration: number;
  difficulty: string;
  image: string;
  podcasts: Podcast[];
  exam?: string;
  board?: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching course details for:", courseId);
        
        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          setError(`Failed to load course: ${courseError.message}`);
          setLoading(false);
          return;
        }
        
        if (!courseData) {
          console.log("No course found with ID:", courseId);
          setError("Course not found");
          setLoading(false);
          return;
        }
        
        console.log("Course data fetched:", courseData);
        
        // Fetch podcasts for the course
        const { data: podcastsData, error: podcastsError } = await supabase
          .from('podcasts')
          .select('*')
          .eq('course_id', courseId);
        
        if (podcastsError) {
          console.error("Error fetching podcasts:", podcastsError);
          setError(`Failed to load podcasts: ${podcastsError.message}`);
          setLoading(false);
          return;
        }
        
        console.log("Podcasts data fetched:", podcastsData);
        
        // Calculate total duration
        const totalDuration = podcastsData?.reduce((sum, podcast) => sum + (podcast.duration || 0), 0) || 0;
        
        // Transform podcasts data to match the expected format
        const formattedPodcasts: Podcast[] = (podcastsData || []).map(podcast => ({
          id: podcast.id,
          title: podcast.title,
          courseId: podcast.course_id,
          courseName: courseData.title,
          duration: podcast.duration || 0,
          progress: 0, // We'll fetch this from user_progress in a real app
          completed: false, // We'll fetch this from user_progress in a real app
          image: podcast.image_url || courseData.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
        }));
        
        // Set course with formatted data
        setCourse({
          id: courseData.id,
          title: courseData.title,
          subject: courseData.subject || "math",
          description: courseData.description || "No description available",
          totalPodcasts: podcastsData?.length || 0,
          completedPodcasts: 0, // Will be fetched from user_progress in a real app
          totalDuration: totalDuration,
          difficulty: "Intermediate", // Hardcoded for now
          image: courseData.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
          podcasts: formattedPodcasts,
          exam: courseData.exam || "GCSE",
          board: courseData.board || "AQA"
        });
        
        setLoading(false);
      } catch (error: any) {
        console.error("Error in fetchCourseDetails:", error);
        setError(error.message || "Failed to load course details");
        setLoading(false);
        toast({
          title: "Error",
          description: error.message || "Failed to load course details",
          variant: "destructive"
        });
      }
    };
    
    fetchCourseDetails();
  }, [courseId, toast]);
  
  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 pb-4 animate-slide-up">
          {/* Header with back button skeleton */}
          <div className="flex items-center space-x-2 pt-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Course Hero Section skeleton */}
          <div className="rounded-xl overflow-hidden relative h-48 bg-gray-200 animate-pulse"></div>
          
          {/* Progress Section skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <Skeleton className="h-2 w-full mt-2" />
          </div>
          
          {/* Tabs Section skeleton */}
          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-4">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
            <div className="space-y-4 pt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full py-12">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
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
  
  const completionPercentage = Math.round((course.completedPodcasts / course.totalPodcasts) * 100) || 0;
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
            {course.podcasts.length > 0 ? (
              course.podcasts.map((podcast) => (
                <PodcastCard 
                  key={podcast.id}
                  {...podcast}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Play className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-medium text-gray-700">No episodes yet</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Check back later for new content
                </p>
              </div>
            )}
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
                    <p>Build confidence for your {course.exam} exams</p>
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
