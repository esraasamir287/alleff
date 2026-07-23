import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Loader2,
  Send,
} from 'lucide-react';
import { QuizLayout } from '../components/quiz/QuizLayout';
import { QuizConfirmDialog } from '../components/quiz/QuizConfirmDialog';
import { useAuth } from '../context/useAuth';
import { submitQuiz } from '../lib/quizApi';
import type { AnswerPayload, QuizStartData } from '../types/quiz';

interface ReviewState {
  quizData: QuizStartData;
  answers: AnswerPayload[];
}

export function QuizReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const state = (location.state as ReviewState | null) ?? null;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const questions = useMemo(() => state?.quizData.questions ?? [], [state]);
  const answers = useMemo(() => state?.answers ?? [], [state]);
  const answeredCount = useMemo(
    () => answers.filter((a) => a.selectedOptionId).length,
    [answers],
  );
  const unansweredCount = questions.length - answeredCount;

  function answerForQuestion(questionId: string): AnswerPayload | undefined {
    return answers.find((a) => a.questionId === questionId);
  }

  function optionText(questionId: string, optionId: string): string {
    const q = questions.find((q) => q.id === questionId);
    return q?.options.find((o) => o.id === optionId)?.optionText ?? '—';
  }

  async function handleConfirmSubmit() {
    if (!attemptId || !state) return;
    setSubmitting(true);
    setError(undefined);
    const result = await submitQuiz(attemptId, answers);
    if (result.success && result.data) {
      navigate(`/quiz/result/${attemptId}`, {
        state: { result: result.data },
        replace: true,
      });
    } else {
      setError(result.message);
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  if (!state) {
    return (
      <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="h-12 w-12 text-secondary-200" aria-hidden="true" />
          <p className="text-base font-bold text-primary">
            انتهت صلاحية جلسة المراجعة. يرجى بدء الامتحان من جديد.
          </p>
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

  return (
    <QuizLayout isAuthenticated={!!user} showAuth={false}>
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">مراجعة الإجابات</h1>
          <p className="mt-2 text-sm text-muted">
            راجع إجاباتك قبل التسليم النهائي. يمكنك العودة لإكمال الأسئلة غير المُجابة.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-green-700">أسئلة مُجابة</p>
              <p className="text-xl font-extrabold text-green-800">{answeredCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-4">
            <HelpCircle className="h-6 w-6 shrink-0 text-accent-dark" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-accent-dark">أسئلة غير مُجابة</p>
              <p className="text-xl font-extrabold text-primary">{unansweredCount}</p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <div className="rounded-4xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="mb-4 text-sm font-extrabold text-primary">ملخص الإجابات</h2>
          <ol className="flex flex-col gap-3">
            {questions.map((q, i) => {
              const ans = answerForQuestion(q.id);
              const answered = !!ans?.selectedOptionId;
              return (
                <li key={q.id} className="flex items-start gap-3 rounded-2xl bg-soft p-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                      answered ? 'bg-green-100 text-green-700' : 'bg-accent/20 text-accent-dark'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-primary line-clamp-2">{q.questionText}</p>
                    <p className="mt-1 text-xs text-muted">
                      {answered
                        ? `إجابتك: ${optionText(q.id, ans!.selectedOptionId)}`
                        : 'لم تتم الإجابة'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(`/quiz/run/${attemptId}`, {
                state: { quizData: state.quizData },
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-secondary-100 bg-white px-5 py-3 text-sm font-bold text-primary transition-all hover:bg-soft"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            العودة للأسئلة
          </button>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                جارٍ التسليم...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                تسليم الامتحان
              </>
            )}
          </button>
        </div>
      </div>

      <QuizConfirmDialog
        open={confirmOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
        submitting={submitting}
      />
    </QuizLayout>
  );
}
