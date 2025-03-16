
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CourseErrorProps {
  error: string;
}

const CourseError: React.FC<CourseErrorProps> = ({ error }) => {
  // Determine if this is a "No course ID" error
  const isNoCourseIdError = error === "No course ID provided";
  
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-500 mb-6 text-center max-w-md px-4">{error}</p>
        <Button asChild>
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default CourseError;
