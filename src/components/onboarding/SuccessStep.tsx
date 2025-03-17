
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface SuccessStepProps {
  onComplete: () => void;
}

const SuccessStep = ({ onComplete }: SuccessStepProps) => {
  return (
    <div className="space-y-6 text-center">
      <div className="w-24 h-24 bg-green-500/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center">
        <Check className="h-12 w-12 text-green-500" />
      </div>
      <p className="text-zinc-300">
        Your account has been created successfully. You're all set to start exploring educational content!
      </p>
      
      <Button 
        size="lg" 
        className="w-full bg-white text-black hover:bg-white/90 mt-4"
        onClick={onComplete}
      >
        Start Learning
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default SuccessStep;
