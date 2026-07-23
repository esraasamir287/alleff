import { useState, type FormEvent } from 'react';
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
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  submitPublicSubscription,
  type ClassDay,
  type PublicSubscriptionResult,
  type StudySystemValue,
} from '../lib/subscriptionApi';
import { QuizLayout } from '../components/quiz/QuizLayout';
import { FormInput } from '../components/form/FormInput';
import { StudySystemSelect } from '../components/form/StudySystemSelect';
import {
  validateRequired,
  validateEmail,
  validateEgyptianPhone,
} from '../utils/validation';
import { Button } from '../components/ui/Button';

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

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  studySystem?: string;
  classDay?: string;
}

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
  const { user, loading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studySystem, setStudySystem] = useState<StudySystemValue | ''>('');
  const [onlineChoice, setOnlineChoice] = useState<OnlineChoice>('');
  const [classDay, setClassDay] = useState<ClassDay | ''>('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | undefined>();

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

  function validate(): boolean {
    const next: FieldErrors = {
      fullName: validateRequired(fullName),
      email: validateEmail(email),
      phone: validateEgyptianPhone(phone),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return false;

    if (!onlineChoice) {
      setValidationError('يرجى اختيار نعم أو لا للمتابعة.');
      return false;
    }
    if (wantsOnline && !classDay) {
      setValidationError('يرجى اختيار يوم الحصة المباشرة.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSubmitError(undefined);
    setValidationError(undefined);

    if (!validate()) return;

    setSaving(true);

    const result = await submitPublicSubscription({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      studySystem: studySystem || null,
      wantsOnline,
      classDay: wantsOnline ? (classDay as ClassDay) : null,
    });

    if (result.success) {
      setSubmitted(true);
      setSaving(false);
    } else {
      if (result.fieldErrors) {
        setErrors({
          fullName: result.fieldErrors.fullName,
          email: result.fieldErrors.email,
          phone: result.fieldErrors.phone,
          studySystem: result.fieldErrors.studySystem,
          classDay: result.fieldErrors.classDay,
        });
      }
      setSubmitError(result.message);
      setSaving(false);
    }
  }

  return (
    <QuizLayout isAuthenticated={!!user && !loading} showAuth={false}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            الاشتراك في الكورس
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            ابدأ خطوتك الأولى نحو النجاح
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            املأ بيانات واختر طريقة الاشتراك المناسبة لك. لا تحتاج إلى إنشاء حساب —
            فقط أدخل بياناتك وسنتواصل معك.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-green-200 bg-green-50 px-6 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-extrabold text-primary">تم استلام طلبك بنجاح!</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                {wantsOnline
                  ? 'سجلنا رغبتك في الاشتراك أونلاين. سنتواصل معك قريبًا لإتمام التسجيل وتأكيد ميعاد الحصة.'
                  : 'تم حفظ بياناتك. شكرًا لاهتمامك، وسنتواصل معك في حال رغبت في الاشتراك لاحقًا.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button as="link" to="/" variant="primary" size="lg">
                العودة للرئيسية
              </Button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setOnlineChoice('');
                  setClassDay('');
                }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-secondary px-6 py-3 text-sm font-bold text-secondary transition-all hover:bg-secondary hover:text-white"
              >
                إرسال طلب آخر
              </button>
            </div>
          </div>
        ) : (
          <>
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <p className="text-sm font-bold text-red-700">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Contact info */}
              <div className="rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-6">
                <h2 className="text-base font-extrabold text-primary">بياناتك الشخصية</h2>
                <p className="mt-1 text-sm text-muted">
                  سنستخدم هذه البيانات للتواصل معك بخصوص اشتراكك.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormInput
                      name="fullName"
                      label="الاسم الكامل"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={errors.fullName}
                      errorId="fullName-error"
                      required
                      placeholder="الاسم ثلاثي"
                    />
                  </div>
                  <FormInput
                    name="email"
                    label="البريد الإلكتروني"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    errorId="email-error"
                    required
                    placeholder="example@email.com"
                  />
                  <FormInput
                    name="phone"
                    label="رقم الهاتف"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    errorId="phone-error"
                    required
                    placeholder="01012345678"
                  />
                  <div className="sm:col-span-2">
                    <StudySystemSelect
                      name="study-system"
                      label="نظام الدراسة"
                      value={studySystem}
                      onChange={(v) => setStudySystem(v)}
                      errorId="study-system-error"
                    />
                  </div>
                </div>
              </div>

              {/* Online choice */}
              <fieldset className="flex flex-col gap-5">
                <legend className="sr-only">خيار الاشتراك أونلاين</legend>

                <div className="text-center">
                  <h2 className="text-lg font-extrabold text-primary">
                    هل ترغب في الاشتراك أونلاين؟
                  </h2>
                </div>

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
                      <h3 className="text-base font-extrabold text-primary">
                        اختر يوم الحصة المباشرة
                      </h3>
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
                    <h3 className="text-base font-extrabold text-primary">ماذا يشمل الاشتراك؟</h3>
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
                  ) : (
                    <>
                      <Save className="h-5 w-5" aria-hidden="true" />
                      إرسال الطلب
                    </>
                  )}
                </button>
              </fieldset>
            </form>
          </>
        )}
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
