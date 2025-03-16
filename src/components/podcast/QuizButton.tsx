
import React from "react";
import { BrainCircuit } from "lucide-react";

interface QuizButtonProps {
  onClick: () => void;
}

const QuizButton = ({ onClick }: QuizButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-lg bg-primary/10 text-primary font-medium flex items-center justify-center"
    >
      <BrainCircuit className="h-5 w-5 mr-2" />
      Take Quiz
    </button>
  );
};

export default QuizButton;
