
import React from "react";
import { useParams } from "react-router-dom";
import { Play, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our new components
import CourseHeader from "@/components/course/CourseHeader";
import CourseBanner from "@/components/course/CourseBanner";
import CourseProgress from "@/components/course/CourseProgress";
import CourseEpisodes from "@/components/course/CourseEpisodes";
import CourseAbout from "@/components/course/CourseAbout";
import CourseLoading from "@/components/course/CourseLoading";
import CourseError from "@/components/course/CourseError";
import CourseNotFound from "@/components/course/CourseNotFound";
import { useCourseDetail } from "@/hooks/useCourseDetail";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error } = useCourseDetail(courseId);
  
  // Handle loading state
  if (loading) {
    return <CourseLoading />;
  }
  
  // Handle error state
  if (error) {
    return <CourseError error={error} />;
  }
  
  // Handle course not found
  if (!course) {
    return <CourseNotFound />;
  }
  
  return (
    <Layout>
      <div className="space-y-6 pb-4 animate-slide-up">
        <CourseHeader title="Course Details" />
        
        <CourseBanner 
          title={course.title}
          description={course.description}
          difficulty={course.difficulty}
          totalDuration={course.totalDuration}
          subject={course.subject}
          image={course.image}
        />
        
        <CourseProgress 
          completedPodcasts={course.completedPodcasts}
          totalPodcasts={course.totalPodcasts}
          subject={course.subject}
        />
        
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
          
          <TabsContent value="episodes">
            <CourseEpisodes podcasts={course.podcasts} />
          </TabsContent>
          
          <TabsContent value="about">
            <CourseAbout 
              description={course.description}
              difficulty={course.difficulty}
              totalDuration={course.totalDuration}
              exam={course.exam}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CourseDetail;
