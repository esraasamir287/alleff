import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { QuizLayout } from '../components/quiz/QuizLayout';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { AnswerOptionCard } from '../components/quiz/AnswerOptionCard';
import { QuizNavigation } from '../components/quiz/QuizNavigation';
import { useAuth } from '../context/useAuth';
import type { AnswerPayload, QuizStartData } from '../types/quiz';

export function QuizPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [quizData] = useState<QuizStartData | null>(
    (location.state as { quizData?: QuizStartData } | null)?.quizData ?? null,
  );
  const [loading, setLoading] = useState(!quizData);
  const [error, setError] = useState<string | undefined>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // If we arrived without state (e.g. refresh), we cannot safely resume from
  // the client alone — the attempt exists server-side but we don't cache the
  // questions. Redirect to the intro page to start fresh.
  useEffect(() => {
    if (!quizData && attemptId) {
      setError('انتهت صلاحية جلسة الامتحان. يرجى بدء الامتحان من جديد.');
      setLoading(false);
    }
  }, [quizData, attemptId]);

  const questions = quizData?.questions ?? [];
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;

  function handleSelectOption(optionId: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  }

  function handlePrevious() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(total - 1, i + 1));
  }

  function handleSubmit() {
    if (!quizData || !attemptId) return;
    const payload: AnswerPayload[] = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    navigate(`/quiz/review/${attemptId}`, {
      state: { quizData, answers: payload, answeredCount },
    });
  }

  function handleTimeUp() {
    handleSubmit();
  }

  if (loading) {
    return (
      <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
        </div>
      </QuizLayout>
    );
  }

  if (error || !quizData || !currentQuestion) {
    return (
      <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-secondary-200" aria-hidden="true" />
          <p className="text-base font-bold text-primary">{error ?? 'حدث خطأ غير متوقع.'}</p>
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-800"
          >
            العودة لقائمة الامتحانات
          </button>
        </div>
      </QuizLayout>
    );
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const canProceed = !!selectedOptionId;

  return (
    <QuizLayout isAuthenticated={!!user} showAuth={false}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-extrabold text-primary sm:text-xl">{quizData.exam.title}</h1>
          {quizData.exam.durationMinutes && (
            <QuizTimer
              durationMinutes={quizData.exam.durationMinutes}
              startedAt={quizData.attempt.startedAt}
              onTimeUp={handleTimeUp}
            />
          )}
        </div>

        <QuizProgress current={currentIndex + 1} total={total} />

        <div className="rounded-4xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-8">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl brand-gradient text-sm font-extrabold text-white">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-muted">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'درجة' : 'درجات'}
            </span>
          </div>

          <h2 className="mb-6 text-xl font-extrabold leading-relaxed text-primary sm:text-2xl">
            {currentQuestion.questionText}
          </h2>

          <div className="flex flex-col gap-3" role="radiogroup" aria-label="الخيارات">
            {currentQuestion.options.map((option) => (
              <AnswerOptionCard
                key={option.id}
                id={option.id}
                name={currentQuestion.id}
                text={option.optionText}
                selected={selectedOptionId === option.id}
                onSelect={() => handleSelectOption(option.id)}
              />
            ))}
          </div>
        </div>

        <QuizNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isFirst={isFirst}
          isLast={isLast}
          canProceed={canProceed}
          submitting={false}
        />
      </div>
    </QuizLayout>
  );
}
