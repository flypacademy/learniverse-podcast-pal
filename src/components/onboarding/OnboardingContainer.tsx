
import React from "react";

interface OnboardingContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showHeader?: boolean;
}

const OnboardingContainer = ({ 
  title, 
  description, 
  children, 
  showHeader = true 
}: OnboardingContainerProps) => {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto">
      {showHeader && (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
      )}

      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default OnboardingContainer;
