
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import CourseCard from "@/components/CourseCard";
import { RecentCourse } from "@/hooks/useRecentCourses";

interface ContinueLearningProps {
  courses: RecentCourse[];
  loading: boolean;
  handleLinkClick?: () => void; // Make this optional
}

const ContinueLearning = ({ courses, loading, handleLinkClick }: ContinueLearningProps) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const onLinkClick = () => {
    // Only call handleLinkClick if it exists
    if (handleLinkClick) {
      handleLinkClick();
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-semibold text-xl text-gray-900">
          Continue Learning
        </h2>
        <Link 
          to="/courses" 
          className="text-primary flex items-center text-sm font-medium"
          onClick={onLinkClick}
        >
          View all
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <div className="h-48 bg-gray-100 animate-pulse rounded-xl"></div>
          <div className="flex justify-center">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-4 rounded-full bg-gray-200"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      ) : courses && courses.length > 0 ? ( // Add null check for courses
        <Carousel 
          className="w-full"
          onSelect={(index) => {
            // Ensure we're working with a number
            if (typeof index === 'number') {
              setActiveSlide(index);
            }
          }}
        >
          <CarouselContent>
            {courses.map((course) => (
              <CarouselItem key={course.id} className="md:basis-1/1">
                <CourseCard 
                  id={course.id}
                  title={course.title}
                  subject={course.subject}
                  totalPodcasts={course.totalPodcasts}
                  completedPodcasts={course.completedPodcasts}
                  image={course.image}
                  size="large"
                  exam={course.exam}
                  board={course.board}
                  achievements={course.achievements}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-2">
            <div className="flex gap-1.5">
              {courses.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full ${index === activeSlide ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </Carousel>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-medium mb-1">No Courses Yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            You haven't started any courses yet
          </p>
          <Link 
            to="/courses" 
            className="text-primary font-medium text-sm hover:underline"
            onClick={onLinkClick}
          >
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default ContinueLearning;
