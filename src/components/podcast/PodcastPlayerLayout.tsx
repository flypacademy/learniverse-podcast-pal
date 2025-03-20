
import React from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PodcastPlayerLayoutProps {
  courseData: any;
  courseId?: string;
  children: React.ReactNode;
}

const PodcastPlayerLayout = ({ courseData, courseId, children }: PodcastPlayerLayoutProps) => {
  return (
    <Layout>
      <div className="flex flex-col space-y-6 max-w-md mx-auto pb-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link to={courseId ? `/course/${courseId}` : "/courses"}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-sm font-medium text-gray-500">
            {courseData?.title || "Course"}
          </div>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
        
        {children}
      </div>
    </Layout>
  );
};

export default PodcastPlayerLayout;
