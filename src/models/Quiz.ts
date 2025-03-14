
// Quiz types for the application
export interface Quiz {
  id: string;
  podcastId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in seconds, optional
  xpReward: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation?: string; // optional explanation for correct answer
  image?: string; // optional image URL
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: number[]; // array of selected answer indices
  score: number; // percentage score
  timeTaken: number; // in seconds
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// Functions to generate quizzes (placeholder for backend integration)
export const generateQuizFromPrompt = async (
  podcastId: string,
  title: string,
  prompt: string,
  numberOfQuestions: number
): Promise<Quiz> => {
  // This would connect to a backend API to generate the quiz
  // For now, return a sample quiz
  return {
    id: `quiz-${Date.now()}`,
    podcastId,
    title,
    description: `Quiz for "${title}"`,
    questions: [
      {
        id: "q1",
        question: "Sample question 1",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
      },
      {
        id: "q2",
        question: "Sample question 2",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 1,
      },
      {
        id: "q3",
        question: "Sample question 3",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 2,
      },
    ],
    passingScore: 60,
    xpReward: 50,
  };
};

// Function for creating a new quiz
export const createQuiz = async (quiz: Omit<Quiz, "id">): Promise<Quiz> => {
  // This would connect to a backend API to save the quiz
  // For now, return a sample response
  return {
    ...quiz,
    id: `quiz-${Date.now()}`,
  };
};
