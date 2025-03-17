
import React from "react";
import { BrainCircuit } from "lucide-react";

interface QuizButtonProps {
  onClick: () => void;
}

const QuizButton = ({ onClick }: QuizButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary/90 to-primary text-white font-medium flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <BrainCircuit className="h-5 w-5 mr-2" />
      Take Quiz
    </button>
  );
};

export default QuizButton;
