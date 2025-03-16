
import React from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CourseErrorProps {
  error: string;
}

const CourseError: React.FC<CourseErrorProps> = ({ error }) => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // Log the error and courseId for debugging
  console.log("CourseError component rendering with:", { error, courseId });
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-500 mb-2 text-center max-w-md px-4">{error}</p>
        
        {/* Show the courseId if it exists */}
        {courseId && (
          <p className="text-sm text-gray-400 mb-6 text-center">
            Course ID: {courseId}
          </p>
        )}
        
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default CourseError;
