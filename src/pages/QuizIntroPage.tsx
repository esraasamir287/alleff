import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Target,
  Repeat,
  ListChecks,
  AlertCircle,
  Loader2,
  Play,
  Home,
  BookOpenCheck,
  Youtube,
} from 'lucide-react';
import { QuizLayout } from '../components/quiz/QuizLayout';
import { useAuth } from '../context/useAuth';
import { getPublicExams, startQuiz } from '../lib/quizApi';
import { supabase } from '../lib/supabaseClient';
import type { QuizExam } from '../types/quiz';

interface QuizMeta {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  passingPercentage: number;
  allowedAttempts: number;
}

const FOUNDATION_PLAYLIST_URL =
  'https://youtube.com/playlist?list=PLeR9ZoevQ6Hk&si=zBTSh1vC0yvMlu2I';

const FOUNDATION_QUESTION = 'هل ذاكرت محاضرات التأسيس؟';

const INSTRUCTIONS = [
  'الامتحان مجاني ومتاح لجميع الطلاب المسجلين.',
  'كل سؤال له إجابة واحدة صحيحة فقط.',
  'يمكنك التنقل بين الأسئلة باستخدام زري «السابق» و«التالي».',
  'لن تظهر الإجابة الصحيحة أثناء الامتحان.',
  'لا يمكن تعديل الإجابات بعد التسليم النهائي.',
  'يجب اختيار إجابة قبل الانتقال للسؤال التالي.',
];

export function QuizIntroPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<QuizMeta[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [studied, setStudied] = useState<boolean | null>(null);
  const [gateConfirming, setGateConfirming] = useState(false);

  const studySystem = profile?.studySystem ?? null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getPublicExams();
      if (!mounted) return;
      setExams(data);

      // Fetch question counts. questions has a SELECT policy allowing
      // authenticated users to count questions for published public exams
      // (only id/exam_id are exposed, never question text or options).
      const counts: Record<string, number> = {};
      for (const exam of data) {
        const { count } = await supabase
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('exam_id', exam.id);
        counts[exam.id] = count ?? 0;
      }
      if (!mounted) return;
      setQuestionCounts(counts);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleStart(exam: QuizExam) {
    setStartingId(exam.id);
    setError(undefined);
    const result = await startQuiz(exam.id);
    if (result.success && result.data) {
      navigate(`/quiz/run/${result.data.attempt.id}`, {
        state: { quizData: result.data },
        replace: true,
      });
    } else {
      setError(result.message);
      setStartingId(null);
    }
  }

  // Languages student — no exam exists yet. Show coming-soon message.
  const showComingSoon = !loading && studySystem === 'languages' && exams.length === 0;

  return (
    <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            امتحان عام مجاني
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            الامتحان العام
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            اختبر معلوماتك من خلال الامتحان العام المجاني. متاح لجميع الطلاب المسجلين.
          </p>
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

        {studied === null ? (
          <FoundationGate
            value={studied}
            pending={gateConfirming}
            onSelect={(v) => {
              setGateConfirming(true);
              // Brief delay so the "Yes" path can render its success state before
              // revealing the exam list; keeps the transition from feeling jumpy.
              window.setTimeout(() => {
                setStudied(v);
                setGateConfirming(false);
              }, 180);
            }}
          />
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" aria-hidden="true" />
          </div>
        ) : showComingSoon ? (
          <div className="rounded-4xl border border-secondary-100 bg-white p-8 text-center shadow-soft sm:p-12">
            <ClipboardList className="mx-auto h-14 w-14 text-secondary-200" aria-hidden="true" />
            <p className="mt-6 text-lg font-extrabold text-primary sm:text-xl">
              امتحان نظام اللغات سيتم إضافته قريبًا.
            </p>
            <p className="mt-2 text-sm text-muted">
              يتم حاليًا العمل على إعداد امتحان نظام اللغات. تابعنا للحصول على التحديثات.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 inline-flex items-center gap-2 rounded-full brand-gradient px-8 py-3.5 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        ) : studied === false ? (
          <FoundationPlaylist url={FOUNDATION_PLAYLIST_URL} onBack={() => setStudied(null)} />
        ) : exams.length === 0 ? (
          <div className="rounded-4xl border border-secondary-100 bg-white p-8 text-center shadow-soft">
            <ClipboardList className="mx-auto h-12 w-12 text-secondary-200" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-primary">لا توجد امتحانات متاحة حاليًا</p>
            <p className="mt-1 text-sm text-muted">يرجى المحاولة لاحقًا.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-4xl border border-secondary-100 bg-white p-6 shadow-soft sm:p-8"
              >
                <h2 className="text-xl font-extrabold text-primary sm:text-2xl">{exam.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {exam.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetaItem icon={<ListChecks className="h-5 w-5" />} label="عدد الأسئلة" value={questionCounts[exam.id] ? `${questionCounts[exam.id]} سؤال` : '—'} />
                  <MetaItem
                    icon={<Clock className="h-5 w-5" />}
                    label="المدة"
                    value={exam.durationMinutes ? `${exam.durationMinutes} دقيقة` : 'بدون حد زمني'}
                  />
                  <MetaItem icon={<Target className="h-5 w-5" />} label="درجة النجاح" value={`${exam.passingPercentage}%`} />
                  <MetaItem
                    icon={<Repeat className="h-5 w-5" />}
                    label="المحاولات"
                    value={exam.allowedAttempts === 0 ? 'غير محدود' : `${exam.allowedAttempts}`}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-soft p-4 sm:p-5">
                  <h3 className="mb-3 text-sm font-extrabold text-primary">تعليمات هامة</h3>
                  <ul className="flex flex-col gap-2">
                    {INSTRUCTIONS.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                        <span className="leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleStart(exam)}
                  disabled={startingId === exam.id}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient px-6 py-4 text-base font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:opacity-60 disabled:pointer-events-none sm:w-auto sm:justify-start"
                >
                  {startingId === exam.id ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      جارٍ بدء الامتحان...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" aria-hidden="true" />
                      ابدأ الامتحان
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </QuizLayout>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-soft p-3 text-center">
      <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700">
        {icon}
      </span>
      <span className="text-xs font-bold text-muted">{label}</span>
      <span className="text-sm font-extrabold text-primary">{value}</span>
    </div>
  );
}

function FoundationGate({
  value,
  pending,
  onSelect,
}: {
  value: boolean | null;
  pending: boolean;
  onSelect: (value: boolean) => void;
}) {
  return (
    <section
      aria-labelledby="foundation-gate-title"
      className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-4xl border border-lavender bg-white px-6 py-10 text-center shadow-soft sm:px-10"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-700">
        <BookOpenCheck className="h-8 w-8" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h2
          id="foundation-gate-title"
          className="text-xl font-extrabold text-primary sm:text-2xl"
        >
          {FOUNDATION_QUESTION}
        </h2>
        <p className="text-sm font-semibold text-muted">
          المحاضرات التأسيسية شرط أساسي للامتحان. تأكد من إتمامها أولًا.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => onSelect(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-soft transition hover:bg-primary-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && value === true ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
          )}
          نعم، ذاكرت
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => onSelect(false)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-lavender bg-soft px-5 py-3.5 text-sm font-extrabold text-primary transition hover:bg-lavender focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && value === false ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          )}
          لا، لم أذاكر
        </button>
      </div>
    </section>
  );
}

function FoundationPlaylist({ url, onBack }: { url: string; onBack: () => void }) {
  return (
    <section
      aria-labelledby="foundation-playlist-title"
      className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-4xl border border-lavender bg-white px-6 py-10 text-center shadow-soft sm:px-10"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <Youtube className="h-8 w-8" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h2
          id="foundation-playlist-title"
          className="text-xl font-extrabold text-primary sm:text-2xl"
        >
          ابدأ بمحاضرات التأسيس أولًا
        </h2>
        <p className="text-sm font-semibold text-muted">
          لمتابعة قائمة المحاضرات التأسيسية على يوتيوب، اضغط الزر أدناه. بعد إتمامها عُد لبدء الامتحان.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-soft transition hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
      >
        <Youtube className="h-5 w-5" aria-hidden="true" />
        محاضرات التأسيس على يوتيوب
      </a>
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-bold text-muted underline-offset-4 transition hover:text-primary hover:underline"
      >
        العودة إلى السؤال
      </button>
    </section>
  );
}
