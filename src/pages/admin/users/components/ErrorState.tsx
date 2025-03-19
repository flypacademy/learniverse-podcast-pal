
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
      <AlertCircle className="h-5 w-5" />
      <div>
        <p className="font-medium">Error loading users</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
};

export default ErrorState;
