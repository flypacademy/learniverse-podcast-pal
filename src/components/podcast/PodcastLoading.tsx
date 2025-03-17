
import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PodcastLoadingProps {
  onRetry?: () => void;
}

const PodcastLoading = ({ onRetry }: PodcastLoadingProps) => {
  const [showRetry, setShowRetry] = useState(false);
  
  useEffect(() => {
    // After 5 seconds, show the retry button
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading podcast...</p>
      
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          className="mt-6 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Loading
        </Button>
      )}
    </div>
  );
};

export default PodcastLoading;
