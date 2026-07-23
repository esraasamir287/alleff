export type QuestionType = 'single_choice';

export interface QuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  displayOrder: number;
  options: QuestionOption[];
}

export interface QuizExam {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  passingPercentage: number;
  allowedAttempts: number;
}

export interface QuizAttempt {
  id: string;
  startedAt: string;
}

export interface QuizStartData {
  exam: QuizExam;
  attempt: QuizAttempt;
  questions: QuizQuestion[];
}

export interface AnswerPayload {
  questionId: string;
  selectedOptionId: string;
}

export interface QuizResultData {
  attemptId: string;
  score: number;
  totalScore: number;
  percentage: number;
  passingPercentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
}

export interface ReviewOption {
  id: string;
  optionText: string;
  displayOrder: number;
  isCorrect: boolean;
}

export interface ReviewItem {
  questionId: string;
  questionText: string;
  points: number;
  displayOrder: number;
  options: ReviewOption[];
  selectedOptionId: string | null;
  isCorrect: boolean;
  awardedPoints: number;
  answered: boolean;
}

export interface QuizReviewData {
  attempt: {
    id: string;
    score: number;
    totalScore: number;
    percentage: number;
    submittedAt: string;
  };
  review: ReviewItem[];
}
