
import React, { useState } from "react";
import { X, ChevronRight, AlertCircle, Check, Medal } from "lucide-react";

// Defining the quiz question model
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  image?: string;
}

interface QuizModalProps {
  questions: QuizQuestion[];
  podcastTitle: string;
  onClose: () => void;
  onComplete: (score: number) => void;
}

const QuizModal = ({ questions, podcastTitle, onClose, onComplete }: QuizModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleOptionSelect = (optionIndex: number) => {
    if (showFeedback) return; // Don't allow changing answer after showing feedback
    setSelectedOption(optionIndex);
  };
  
  const handleNext = () => {
    // Save the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      // Calculate score
      const correctAnswers = newAnswers.filter(
        (answer, index) => answer === questions[index].correctAnswer
      ).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Show quiz summary
      setQuizCompleted(true);
      onComplete(score);
    } else {
      // Move to next question
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handleCheck = () => {
    if (selectedOption === null) return;
    setShowFeedback(true);
  };
  
  const calculateScore = () => {
    const correctAnswers = answers.filter(
      (answer, index) => answer === questions[index].correctAnswer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };
  
  if (quizCompleted) {
    const score = calculateScore();
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-auto animate-scale-in">
          <div className="p-5 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-xl">Quiz Completed!</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Medal className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h4 className="text-2xl font-bold">{score}%</h4>
                <p className="text-gray-500">
                  {score >= 80 ? "Excellent work!" : 
                   score >= 60 ? "Good job!" : 
                   "Keep practicing!"}
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                You answered {answers.filter((answer, index) => answer === questions[index].correctAnswer).length} out of {questions.length} questions correctly.
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-primary text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-auto animate-scale-in">
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg">{podcastTitle}</h3>
              <p className="text-sm text-gray-500">Quiz</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="ml-3 text-gray-600 font-medium">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          
          {/* Question */}
          <div className="py-3">
            <p className="font-medium text-gray-800 text-lg">{currentQuestion.question}</p>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-3 border rounded-lg text-left transition-all ${
                  selectedOption === index 
                    ? showFeedback
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                      : 'bg-primary/10 border-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${
                    selectedOption === index 
                      ? showFeedback
                        ? index === currentQuestion.correctAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {showFeedback && selectedOption === index ? (
                      index === currentQuestion.correctAnswer ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Feedback Message */}
          {showFeedback && (
            <div className={`p-3 rounded-lg flex items-start ${
              selectedOption === currentQuestion.correctAnswer 
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              <div className="mr-3 mt-0.5">
                {selectedOption === currentQuestion.correctAnswer ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {selectedOption === currentQuestion.correctAnswer 
                    ? 'Correct!' 
                    : 'Incorrect!'}
                </p>
                <p className="text-sm">
                  {selectedOption === currentQuestion.correctAnswer 
                    ? 'Great job!' 
                    : `The correct answer is ${currentQuestion.options[currentQuestion.correctAnswer]}`}
                </p>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="pt-2">
            {showFeedback ? (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-lg bg-primary text-white font-medium flex items-center justify-center"
              >
                {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleCheck}
                className="w-full py-3 rounded-lg bg-primary text-white font-medium"
                disabled={selectedOption === null}
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
