
import React from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PodcastErrorProps {
  errorMessage: string;
}

const PodcastError = ({ errorMessage }: PodcastErrorProps) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    window.location.reload();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl font-bold text-red-500">Error</h2>
      <p className="text-gray-600 mt-2">{errorMessage}</p>
      <Button 
        onClick={handleRetry}
        className="mt-6 flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
      <Button 
        onClick={() => navigate(-1)}
        variant="outline"
        className="mt-3"
      >
        Go Back
      </Button>
    </div>
  );
};

export default PodcastError;
