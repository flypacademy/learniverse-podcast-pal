
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-8 min-h-[50vh]">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <div className="flex gap-4">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              Retry
            </Button>
          )}
          
          <Link to="/courses">
            <Button variant="outline">Back to Courses</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorState;
