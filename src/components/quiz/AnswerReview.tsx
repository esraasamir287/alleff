import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ListChecks,
} from 'lucide-react';
import { getQuizReview } from '../../lib/quizApi';
import type { QuizReviewData, ReviewItem } from '../../types/quiz';

interface AnswerReviewProps {
  attemptId: string;
}

export function AnswerReview({ attemptId }: AnswerReviewProps) {
  const [review, setReview] = useState<QuizReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;
    getQuizReview(attemptId).then((res) => {
      if (!mounted) return;
      if (res.success && res.data) {
        setReview(res.data);
      } else {
        setError(res.message);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-4xl border border-secondary-100 bg-white p-8 shadow-soft">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" aria-hidden="true" />
        <p className="text-sm font-bold text-muted">جارٍ تحميل مراجعة الإجابات...</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <p className="text-sm font-bold text-red-700">{error ?? 'تعذّر تحميل المراجعة.'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-secondary" aria-hidden="true" />
        <h2 className="text-xl font-extrabold text-primary sm:text-2xl">مراجعة الإجابات</h2>
      </div>

      <div className="flex flex-col gap-4">
        {review.review.map((item) => (
          <ReviewQuestionCard key={item.questionId} item={item} />
        ))}
      </div>
    </div>
  );
}

function ReviewQuestionCard({ item }: { item: ReviewItem }) {
  const correctOption = item.options.find((o) => o.isCorrect);
  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="rounded-4xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl brand-gradient text-sm font-extrabold text-white">
          {item.displayOrder}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold leading-relaxed text-primary sm:text-lg">
            {item.questionText}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            {item.answered ? (
              item.isCorrect ? (
                <ResultBadge tone="success" icon={<CheckCircle2 className="h-4 w-4" />} text="إجابة صحيحة" />
              ) : (
                <ResultBadge tone="error" icon={<XCircle className="h-4 w-4" />} text="إجابة غير صحيحة" />
              )
            ) : (
              <ResultBadge tone="neutral" icon={<XCircle className="h-4 w-4" />} text="لم تتم الإجابة" />
            )}
            <span className="text-xs font-bold text-muted">
              {item.awardedPoints} / {item.points} {item.points === 1 ? 'درجة' : 'درجات'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {item.options.map((opt, i) => {
          const isSelected = opt.id === item.selectedOptionId;
          const isCorrect = opt.isCorrect;
          let stateClass = 'border-secondary-100 bg-white';
          let badge: React.ReactNode = null;

          if (isCorrect) {
            stateClass = 'border-green-300 bg-green-50';
            badge = (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                الإجابة الصحيحة
              </span>
            );
          } else if (isSelected && !isCorrect) {
            stateClass = 'border-red-300 bg-red-50';
            badge = (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                <XCircle className="h-3.5 w-3.5" />
                إجابتك
              </span>
            );
          }

          return (
            <div
              key={opt.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ${stateClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-xs font-extrabold text-secondary-700">
                  {optionLetters[i] ?? ''}
                </span>
                <span className="text-sm font-semibold leading-relaxed text-ink sm:text-base">
                  {opt.optionText}
                </span>
              </div>
              {badge}
            </div>
          );
        })}
      </div>

      {!item.answered && (
        <div className="mt-3 rounded-2xl bg-soft px-4 py-3">
          <p className="text-xs font-bold text-muted">
            <span className="text-primary">إجابتك:</span> لم تتم الإجابة
          </p>
          {correctOption && (
            <p className="mt-1 text-xs font-bold text-muted">
              <span className="text-green-700">الإجابة الصحيحة:</span> {correctOption.optionText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBadge({
  tone,
  icon,
  text,
}: {
  tone: 'success' | 'error' | 'neutral';
  icon: React.ReactNode;
  text: string;
}) {
  const classes =
    tone === 'success'
      ? 'bg-green-100 text-green-700'
      : tone === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-secondary-100 text-secondary-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${classes}`}>
      {icon}
      {text}
    </span>
  );
}
