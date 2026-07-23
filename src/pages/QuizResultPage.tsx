import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Home,
  Award,
  TrendingUp,
} from 'lucide-react';
import { QuizLayout } from '../components/quiz/QuizLayout';
import { AnswerReview } from '../components/quiz/AnswerReview';
import { useAuth } from '../context/useAuth';
import type { QuizResultData } from '../types/quiz';

interface ResultState {
  result: QuizResultData;
}

function getResultMessage(passed: boolean, percentage: number): string {
  if (passed && percentage >= 90) return 'ممتاز! أداء استثنائي يستحق التقدير.';
  if (passed && percentage >= 75) return 'أحسنت! لقد اجتزت الامتحان بنتيجة جيدة جدًا.';
  if (passed) return 'أحسنت! لقد اجتزت الامتحان بنجاح.';
  if (percentage >= 50) return 'قريب من درجة النجاح. واصل المراجعة وحاول مرة أخرى.';
  return 'لم تصل إلى درجة النجاح هذه المرة. لا تيأس، المراجعة القادمة ستكون أفضل.';
}

export function QuizResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const state = (location.state as ResultState | null) ?? null;
  const result = state?.result;

  if (!result) {
    return (
      <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-base font-bold text-primary">
            تعذّر عرض النتيجة. يرجى العودة للصفحة الرئيسية.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary-800"
          >
            العودة للرئيسية
          </button>
        </div>
      </QuizLayout>
    );
  }

  void attemptId;
  const passed = result.passed;
  const resultMessage = getResultMessage(passed, result.percentage);
  const reviewAttemptId = attemptId ?? result.attemptId;

  return (
    <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
      <div className="flex flex-col gap-6">
        <div
          className={`flex flex-col items-center gap-4 rounded-4xl border p-8 text-center shadow-soft ${
            passed
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <span
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {passed ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" aria-hidden="true" />
            )}
          </span>

          <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
            {passed ? 'نجحت!' : 'لم تنجح'}
          </h1>

          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-extrabold brand-gradient-text">
              {Math.round(result.percentage)}%
            </span>
            <span className="text-sm font-bold text-muted">
              {result.score} من {result.totalScore} درجة
            </span>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-ink sm:text-base">
            {resultMessage}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="النسبة المئوية"
            value={`${Math.round(result.percentage)}%`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="إجابات صحيحة"
            value={`${result.correctCount}`}
            tone="success"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="إجابات خاطئة"
            value={`${result.incorrectCount}`}
            tone="error"
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="درجة النجاح"
            value={`${result.passingPercentage}%`}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full brand-gradient px-8 py-4 text-base font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            العودة إلى الرئيسية
          </button>
        </div>

        <AnswerReview attemptId={reviewAttemptId} />
      </div>
    </QuizLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'error';
}) {
  const toneClasses =
    tone === 'success'
      ? 'bg-green-50 text-green-700'
      : tone === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-secondary-50 text-secondary-700';

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-secondary-100 bg-white p-4 text-center shadow-soft">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses}`}>
        {icon}
      </span>
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="text-lg font-extrabold text-primary">{value}</span>
    </div>
  );
}
