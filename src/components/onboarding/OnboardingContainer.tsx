
import React from "react";

interface OnboardingContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const OnboardingContainer = ({ title, description, children }: OnboardingContainerProps) => {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-display font-bold text-primary">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default OnboardingContainer;
