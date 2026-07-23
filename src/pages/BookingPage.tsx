import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Video,
  MapPin,
  Clock,
  Calendar,
  Check,
  Loader2,
  AlertCircle,
  Save,
  Pencil,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  fetchBooking,
  saveBooking,
  type AttendanceMode,
  type ClassTime,
  type Booking,
} from '../lib/bookingApi';
import { QuizLayout } from '../components/quiz/QuizLayout';

const ONLINE_START_DATE = '٢٠ أغسطس';

interface SlotOption {
  value: ClassTime;
  label: string;
  hint: string;
}

const SLOT_OPTIONS: SlotOption[] = [
  { value: '09:00', label: '٩:٠٠ صباحًا', hint: 'الخميس' },
  { value: '11:00', label: '١١:٠٠ صباحًا', hint: 'الخميس' },
];

type ModeChoice = AttendanceMode | '';

export function BookingPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  const [initializing, setInitializing] = useState(true);
  const [existing, setExisting] = useState<Booking | null>(null);
  const [modeChoice, setModeChoice] = useState<ModeChoice>('');
  const [classTime, setClassTime] = useState<ClassTime | ''>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | undefined>();

  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    if (!user) {
      setInitializing(false);
      return;
    }
    let mounted = true;
    fetchBooking(user.id)
      .then((booking) => {
        if (!mounted) return;
        setExisting(booking);
        if (booking) {
          setModeChoice(booking.wantsOnline ? 'online' : 'offline');
          setClassTime(booking.classTime ?? '');
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

  const isEditing = !!existing && !saved;
  const isOnline = modeChoice === 'online';

  function handleModeChange(value: ModeChoice) {
    setModeChoice(value);
    setValidationError(undefined);
    if (value !== 'online') setClassTime('');
  }

  function handleSlotChange(value: ClassTime) {
    setClassTime(value);
    setValidationError(undefined);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!modeChoice) {
      setValidationError('يرجى اختيار طريقة الحضور للمتابعة.');
      return;
    }
    if (isOnline && !classTime) {
      setValidationError('يرجى اختيار موعد الحصة.');
      return;
    }

    const choice = {
      mode: modeChoice as AttendanceMode,
      classTime: isOnline ? (classTime as ClassTime) : null,
    };

    setValidationError(undefined);
    setError(undefined);
    setSaving(true);

    try {
      await saveBooking(
        {
          userId: user!.id,
          fullName: profile?.fullName ?? user!.email ?? '',
          email: profile?.email ?? user!.email ?? '',
          phone: profile?.phone ?? '',
          studySystem: profile?.studySystem ?? null,
          academicGrade: profile?.academicGrade ?? null,
          governorate: profile?.governorate ?? null,
        },
        choice,
      );
      setSaved(true);
    } catch {
      setError('تعذر حفظ اختيارك حاليًا. يرجى المحاولة مرة أخرى.');
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
        <ConfirmationView
          mode={modeChoice as AttendanceMode}
          classTime={isOnline ? (classTime as ClassTime) : null}
          onHome={() => navigate('/')}
        />
      </QuizLayout>
    );
  }

  return (
    <QuizLayout isAuthenticated={!!user} userName={profile?.fullName}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            حجز الكورس
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            كيف ترغب بحضور الكورس؟
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            اختر طريقة الحضور المناسبة لك. يمكنك تغيير اختيارك في أي وقت.
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
            <legend className="sr-only">طريقة الحضور</legend>

            {/* Online / Offline choice */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ModeCard
                selected={modeChoice === 'online'}
                onSelect={() => handleModeChange('online')}
                inputId="mode-online"
                name="attendance-mode"
                value="online"
                icon={<Video className="h-6 w-6" />}
                title="أونلاين"
                description="حضور الحصص المباشرة عبر الإنترنت"
              />
              <ModeCard
                selected={modeChoice === 'offline'}
                onSelect={() => handleModeChange('offline')}
                inputId="mode-offline"
                name="attendance-mode"
                value="offline"
                icon={<MapPin className="h-6 w-6" />}
                title="حضوري"
                description="الحضور في مكان محدد"
              />
            </div>

            {/* Slot selection — only when Online */}
            {isOnline && (
              <div className="rounded-3xl border border-secondary-100 bg-soft/60 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary-700" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-primary">
                    اختر موعد الحصة
                  </h2>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  الحصص يوم الخميس، تبدأ في
                  <span className="font-extrabold text-secondary-700">{ONLINE_START_DATE}</span>
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SLOT_OPTIONS.map((slot) => (
                    <SlotCard
                      key={slot.value}
                      slot={slot}
                      selected={classTime === slot.value}
                      onSelect={() => handleSlotChange(slot.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Offline note */}
            {modeChoice === 'offline' && (
              <div className="rounded-3xl border border-secondary-100 bg-soft/60 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary-700" aria-hidden="true" />
                  <h2 className="text-base font-extrabold text-primary">
                    سنتواصل معك للتفاصيل
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  سيتم التواصل معك لتحديد مكان وموعد الحصص الحضورية. يمكنك
                  تأكيد اختيارك الآن وسنتواصل معك قريبًا.
                </p>
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
                  تأكيد الحجز
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </QuizLayout>
  );
}

interface ModeCardProps {
  selected: boolean;
  onSelect: () => void;
  inputId: string;
  name: string;
  value: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ModeCard({
  selected,
  onSelect,
  inputId,
  name,
  value,
  icon,
  title,
  description,
}: ModeCardProps) {
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
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
          selected ? 'brand-gradient text-white' : 'bg-secondary-50 text-secondary-700'
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
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

interface SlotCardProps {
  slot: SlotOption;
  selected: boolean;
  onSelect: () => void;
}

function SlotCard({ slot, selected, onSelect }: SlotCardProps) {
  const inputId = `slot-${slot.value}`;
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
        name="class-slot"
        value={slot.value}
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
        <Clock className="h-6 w-6" />
      </span>
      <span
        className={`text-lg font-extrabold ${selected ? 'text-primary' : 'text-ink'}`}
      >
        {slot.label}
      </span>
      <span className="text-sm font-bold text-secondary-700">{slot.hint}</span>
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

interface ConfirmationViewProps {
  mode: AttendanceMode;
  classTime: ClassTime | null;
  onHome: () => void;
}

function ConfirmationView({ mode, classTime, onHome }: ConfirmationViewProps) {
  const isOnline = mode === 'online';
  const slotLabel =
    classTime === '09:00' ? '٩:٠٠ صباحًا' : classTime === '11:00' ? '١١:٠٠ صباحًا' : '';

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-4xl border border-secondary-100 bg-white px-6 py-12 text-center shadow-soft sm:px-10">
      <span
        className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600"
        aria-hidden="true"
      >
        <Check className="h-10 w-10" />
      </span>
      <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
        تم تأكيد حجزك بنجاح
      </h1>
      <p className="text-base leading-relaxed text-muted">
        {isOnline ? (
          <>
            تم تسجيلك للحضور <span className="font-extrabold text-primary">أونلاين</span>
            {slotLabel && (
              <>
                {' '}يوم الخميس الساعة{' '}
                <span className="font-extrabold text-primary">{slotLabel}</span>
              </>
            )}
            ، تبدأ الحصص في <span className="font-extrabold text-primary">{ONLINE_START_DATE}</span>.
          </>
        ) : (
          <>
            تم تسجيل رغبتك في الحضور <span className="font-extrabold text-primary">الحضوري</span>.
            سنتواصل معك للتفاصيل قريبًا.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onHome}
        className="mt-2 inline-flex items-center gap-2 rounded-full brand-gradient px-8 py-3.5 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
      >
        <Home className="h-5 w-5" aria-hidden="true" />
        العودة إلى الصفحة الرئيسية
      </button>
    </div>
  );
}
