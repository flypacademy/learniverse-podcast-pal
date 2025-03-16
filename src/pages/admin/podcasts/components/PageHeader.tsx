
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";

interface PageHeaderProps {
  courseName: string;
  courseId: string;
}

const PageHeader = ({ courseName, courseId }: PageHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex items-center mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate("/admin/courses")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
          <p className="text-gray-500 mt-1">Podcasts for this course</p>
        </div>
        <Button asChild>
          <Link to={`/admin/courses/${courseId}/podcasts/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Podcast
          </Link>
        </Button>
      </div>
    </>
  );
};

export default PageHeader;
