
import React from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const CourseNotFound = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full py-12">
        <FileQuestion className="h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-500 mb-2 text-center max-w-md px-4">
          The course you're looking for doesn't exist.
        </p>
        {courseId && (
          <p className="text-sm text-gray-400 mb-6 text-center">
            ID: {courseId}
          </p>
        )}
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default CourseNotFound;
