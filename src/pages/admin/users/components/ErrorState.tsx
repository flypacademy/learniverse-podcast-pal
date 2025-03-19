
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-md flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">Error loading users</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
      
      {error.includes("row-level security policy") && (
        <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded-md">
          <p className="font-medium">This might be a permissions issue</p>
          <p>The error suggests you don't have permission to create sample users. This is normal if you're not logged in as an admin.</p>
        </div>
      )}
      
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="self-start"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
