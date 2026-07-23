import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Check,
  Loader2,
  Video,
  Repeat,
  NotebookPen,
  ListChecks,
  Calendar,
  AlertCircle,
  Save,
  Pencil,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  fetchSubscription,
  saveSubscription,
  type ClassDay,
  type Subscription,
  type SubscriptionChoice,
} from '../lib/subscriptionApi';
import { QuizLayout } from '../components/quiz/QuizLayout';

type OnlineChoice = 'yes' | 'no' | '';

interface DayOption {
  value: ClassDay;
  label: string;
  hint: string;
}

const DAY_OPTIONS: DayOption[] = [
  { value: 'thursday', label: 'الخميس', hint: '9:00 صباحًا' },
  { value: 'sunday', label: 'الأحد', hint: '9:00 صباحًا' },
];

const FEATURES = [
  {
    icon: Video,
    title: 'حصص مباشرة أونلاين',
    description: 'حصص أسبوعية مباشرة تشرح الدرس خطوة بخطوة مع إمكانية التفاعل والسؤال.',
  },
  {
    icon: Repeat,
    title: 'تسجيلات الحصص',
    description: 'يمكنك مراجعة تسجيلات كل حصة في أي وقت لاستذكار ما فاتك أو إعادة الشرح.',
  },
  {
    icon: NotebookPen,
    title: 'الواجبات',
    description: 'واجبات عملية بعد كل حصة لتثبيت المفاهيم والتأكد من فهمك للدرس.',
  },
  {
    icon: ListChecks,
    title: 'اختبار قصير لكل حصة',
    description: 'اختبار قصير بعد كل درس يقيس مدى استيعابك ويهيّئك للامتحان النهائي.',
  },
];

export function SubscriptionPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  const [initializing, setInitializing] = useState(true);
  const [existing, setExisting] = useState<Subscription | null>(null);
  const [onlineChoice, setOnlineChoice] = useState<OnlineChoice>('');
  const [classDay, setClassDay] = useState<ClassDay | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | undefined>();

  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    if (!user) {
      setInitializing(false);
      return;
    }
    let mounted = true;
    fetchSubscription(user.id)
      .then((sub) => {
        if (!mounted) return;
        setExisting(sub);
        if (sub) {
          setOnlineChoice(sub.wantsOnline ? 'yes' : 'no');
          setClassDay(sub.classDay ?? '');
        }
      })
      .catch(() => {
        /* non-fatal — allow the student to submit fresh */
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });
    return () => {
      mounted = false;
    };
  }, [user, loading, profileLoading]);

  if (loading || (user && profileLoading) || initializing) {
    return (
      <QuizLayout isAuthenticated={!!user} showAuth={false}>
        <div className="flex justify-center py-20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary"
            aria-hidden="true"
          />
        </div>
      </QuizLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isEditing = !!existing;
  const wantsOnline = onlineChoice === 'yes';

  function handleOnlineChange(value: OnlineChoice) {
    setOnlineChoice(value);
    setValidationError(undefined);
    if (value !== 'yes') setClassDay('');
  }

  function handleDayChange(value: ClassDay) {
    setClassDay(value);
    setValidationError(undefined);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!onlineChoice) {
      setValidationError('يرجى اختيار نعم أو لا للمتابعة.');
      return;
    }
    if (wantsOnline && !classDay) {
      setValidationError('يرجى اختيار يوم الحصة المباشرة.');
      return;
    }

    const choice: SubscriptionChoice = {
      wantsOnline,
      classDay: wantsOnline ? (classDay as ClassDay) : null,
    };

    setValidationError(undefined);
    setError(undefined);
    setSaving(true);

    try {
      await saveSubscription(
        {
          userId: user!.id,
          fullName: user!.fullName,
          email: user!.email,
          phone: user!.phone,
          studySystem: user!.studySystem,
        },
        choice,
      );
      navigate('/', { replace: true });
    } catch {
      setError('تعذر حفظ اختيارك حاليًا. يرجى المحاولة مرة أخرى.');
      setSaving(false);
    }
  }

  return (
    <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            الاشتراك في الكورس
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            هل ترغب في الاشتراك أونلاين؟
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            اختر طريقة الاشتراك المناسبة لك. يمكنك تغيير اختيارك في أي وقت.
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

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="flex flex-col gap-5">
            <legend className="sr-only">خيار الاشتراك أونلاين</legend>

            {/* Yes / No choice */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ChoiceCard
                selected={onlineChoice === 'yes'}
                onSelect={() => handleOnlineChange('yes')}
                inputId="online-yes"
                name="online-enrollment"
                value="yes"
                title="نعم"
                description="أرغب في الاشتراك أونلاين وحضور الحصص المباشرة"
              />
              <ChoiceCard
                selected={onlineChoice === 'no'}
                onSelect={() => handleOnlineChange('no')}
                inputId="online-no"
                name="online-enrollment"
                value="no"
                title="لا"
                description="لا أرغب في الاشتراك أونلاين حاليًا"
              />
            </div>

            {/* Day selection — only when Yes */}
            {wantsOnline && (
              <div className="rounded-3xl border border-secondary-100 bg-soft/60 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary-700" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-primary">
                    اختر يوم الحصة المباشرة
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  الحصص المباشرة تقام الساعة 9:00 صباحًا. اختر اليوم الأنسب لك.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {DAY_OPTIONS.map((day) => (
                    <DayCard
                      key={day.value}
                      day={day}
                      selected={classDay === day.value}
                      onSelect={() => handleDayChange(day.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Feature explanations */}
            {wantsOnline && (
              <div className="rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-6">
                <h2 className="text-base font-extrabold text-primary">ماذا يشمل الاشتراك؟</h2>
                <p className="mt-1 text-sm text-muted">
                  تفاصيل ما ستحصل عليه عند الاشتراك في الكورس أونلاين.
                </p>
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <li
                        key={feature.title}
                        className="flex items-start gap-3 rounded-2xl bg-soft/60 p-4"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700"
                          aria-hidden="true"
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-extrabold text-primary">
                            {feature.title}
                          </span>
                          <span className="text-sm leading-relaxed text-muted">
                            {feature.description}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {validationError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <p className="text-sm font-bold text-red-700">{validationError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full brand-gradient px-6 py-4 text-base font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:opacity-60 disabled:pointer-events-none sm:w-auto sm:self-center"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  جارٍ الحفظ...
                </>
              ) : isEditing ? (
                <>
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                  حفظ التعديلات
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" aria-hidden="true" />
                  حفظ الاختيار
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </QuizLayout>
  );
}

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  inputId: string;
  name: string;
  value: string;
  title: string;
  description: string;
}

function ChoiceCard({
  selected,
  onSelect,
  inputId,
  name,
  value,
  title,
  description,
}: ChoiceCardProps) {
  return (
    <label
      htmlFor={inputId}
      className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 p-6 text-center transition-all focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2 ${
        selected
          ? 'border-secondary bg-secondary-50 shadow-soft'
          : 'border-secondary-100 bg-white hover:border-secondary-200 hover:shadow-soft'
      }`}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        aria-checked={selected}
        className="sr-only"
      />
      <span
        className={`text-lg font-extrabold ${selected ? 'text-primary' : 'text-ink'}`}
      >
        {title}
      </span>
      <span className="text-sm text-muted">{description}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
          selected ? 'brand-gradient border-transparent' : 'border-secondary-200 bg-white'
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="h-4 w-4 text-white" />}
      </span>
    </label>
  );
}

interface DayCardProps {
  day: DayOption;
  selected: boolean;
  onSelect: () => void;
}

function DayCard({ day, selected, onSelect }: DayCardProps) {
  const inputId = `class-day-${day.value}`;
  return (
    <label
      htmlFor={inputId}
      className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 p-6 text-center transition-all focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2 ${
        selected
          ? 'border-secondary bg-white shadow-soft'
          : 'border-secondary-100 bg-white hover:border-secondary-200 hover:shadow-soft'
      }`}
    >
      <input
        id={inputId}
        type="radio"
        name="class-day"
        value={day.value}
        checked={selected}
        onChange={onSelect}
        aria-checked={selected}
        className="sr-only"
      />
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
          selected ? 'brand-gradient text-white' : 'bg-secondary-50 text-secondary-700'
        }`}
        aria-hidden="true"
      >
        <GraduationCap className="h-6 w-6" />
      </span>
      <span
        className={`text-lg font-extrabold ${selected ? 'text-primary' : 'text-ink'}`}
      >
        {day.label}
      </span>
      <span className="text-sm font-bold text-secondary-700">{day.hint}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
          selected ? 'brand-gradient border-transparent' : 'border-secondary-200 bg-white'
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="h-4 w-4 text-white" />}
      </span>
    </label>
  );
}
