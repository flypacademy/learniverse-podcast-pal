
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PodcastErrorProps {
  error: string | null;
}

const PodcastError = ({ error }: PodcastErrorProps) => {
  const navigate = useNavigate();
  
  const handleRetry = () => {
    // Force reload the current page to retry loading
    window.location.reload();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 px-4">
      <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
      <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
      <p className="text-gray-600 text-center mb-6">
        {error || "Failed to load audio player"}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleRetry}
          variant="outline"
          className="min-w-[120px]"
        >
          Retry
        </Button>
        <Button 
          onClick={() => navigate(-1)}
          className="min-w-[120px]"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default PodcastError;
