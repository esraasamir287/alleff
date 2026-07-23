import { supabase } from './supabaseClient';
import type {
  AnswerPayload,
  QuizExam,
  QuizReviewData,
  QuizResultData,
  QuizStartData,
} from '../types/quiz';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function functionUrl(slug: string): string {
  return `${SUPABASE_URL}/functions/v1/${slug}`;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error('NOT_AUTHENTICATED');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

async function callQuizFunction<T>(slug: string, payload: unknown): Promise<T> {
  const headers = await getAuthHeader();
  const response = await fetch(functionUrl(slug), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* malformed body */
  }

  if (!response.ok) {
    const err = data as { message?: string };
    return {
      success: false,
      message: err?.message ?? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    } as unknown as T;
  }

  return data as T;
}

// Fetch published public exams the authenticated student can take.
// RLS already filters by study_system at the database level — only exams
// matching the student's profile study_system (or study_system = 'all') are
// returned. We include study_system in the select so the frontend can
// distinguish "no matching exam" (languages student) from "no exams at all".
export async function getPublicExams(): Promise<QuizExam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('id, title, description, duration_minutes, passing_percentage, allowed_attempts, study_system')
    .eq('access_type', 'public')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    durationMinutes: e.duration_minutes,
    passingPercentage: e.passing_percentage,
    allowedAttempts: e.allowed_attempts,
  }));
}

interface StartQuizResult {
  success: boolean;
  message: string;
  data?: QuizStartData;
}

export async function startQuiz(examId: string): Promise<StartQuizResult> {
  return callQuizFunction<StartQuizResult>('quiz-start', { examId });
}

export interface QuizSubmitResult {
  success: boolean;
  message: string;
  data?: QuizResultData;
}

export async function submitQuiz(
  attemptId: string,
  answers: AnswerPayload[],
): Promise<QuizSubmitResult> {
  return callQuizFunction<QuizSubmitResult>('quiz-submit', { attemptId, answers });
}

export interface QuizReviewResult {
  success: boolean;
  message: string;
  data?: QuizReviewData;
}

export async function getQuizReview(attemptId: string): Promise<QuizReviewResult> {
  return callQuizFunction<QuizReviewResult>('quiz-review', { attemptId });
}
