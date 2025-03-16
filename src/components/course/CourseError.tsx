
import React from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

interface CourseErrorProps {
  error: string;
}

const CourseError: React.FC<CourseErrorProps> = ({ error }) => {
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
};

export default CourseError;
