import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Check, Loader2, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { updateStudySystem } from '../lib/profileApi';
import type { StudySystemValue } from '../lib/authApi';
import { QuizLayout } from '../components/quiz/QuizLayout';

interface StudySystemOption {
  value: StudySystemValue;
  label: string;
  description: string;
  icon: typeof BookOpen;
}

const OPTIONS: StudySystemOption[] = [
  { value: 'arabic', label: 'عربي', description: 'نظام الدراسة باللغة العربية', icon: BookOpen },
  { value: 'languages', label: 'لغات', description: 'نظام الدراسة باللغات', icon: Globe },
];

export function ProfileCompletionPage() {
  const { user, profile, loading, profileLoading, needsProfileCompletion, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<StudySystemValue | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [validationError, setValidationError] = useState<string | undefined>();

  // Still restoring session or loading profile — show nothing yet.
  if (loading || (user && profileLoading)) {
    return (
      <QuizLayout isAuthenticated={false} showAuth={false}>
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
        </div>
      </QuizLayout>
    );
  }

  // No session — shouldn't reach here via routing, but guard anyway.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile already has a study_system — redirect to quiz, no re-editing.
  if (profile && !needsProfileCompletion) {
    return <Navigate to="/quiz" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!selected) {
      setValidationError('يرجى اختيار نظام الدراسة.');
      return;
    }
    setValidationError(undefined);
    setError(undefined);
    setSaving(true);

    try {
      await updateStudySystem(user!.id, selected as StudySystemValue);
      await refreshProfile();
      navigate('/quiz', { replace: true });
    } catch {
      setError('تعذر حفظ نظام الدراسة حاليًا. يرجى المحاولة مرة أخرى.');
      setSaving(false);
    }
  }

  return (
    <QuizLayout isAuthenticated={!!user} showAuth={false}>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            استكمال البيانات
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            اختر نظام الدراسة
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
            يرجى اختيار نظام الدراسة الخاص بك للوصول إلى الامتحان المناسب.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">نظام الدراسة</legend>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {OPTIONS.map((option) => {
                const isSelected = selected === option.value;
                const inputId = `study-system-${option.value}`;
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    htmlFor={inputId}
                    className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 p-6 text-center transition-all focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-2 ${
                      isSelected
                        ? 'border-secondary bg-secondary-50 shadow-soft'
                        : 'border-secondary-100 bg-white hover:border-secondary-200 hover:shadow-soft'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="study-system"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => {
                        setSelected(option.value);
                        setValidationError(undefined);
                      }}
                      aria-checked={isSelected}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                        isSelected ? 'brand-gradient text-white' : 'bg-secondary-50 text-secondary-700'
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="flex flex-col items-center gap-1">
                      <span className={`text-lg font-extrabold ${isSelected ? 'text-primary' : 'text-ink'}`}>
                        {option.label}
                      </span>
                      <span className="text-sm text-muted">{option.description}</span>
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected ? 'brand-gradient border-transparent' : 'border-secondary-200 bg-white'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </span>
                  </label>
                );
              })}
            </div>

            {validationError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <p className="text-sm font-bold text-red-700">{validationError}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
              >
                <p className="text-sm font-bold text-red-700">{error}</p>
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
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  حفظ ومتابعة
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </QuizLayout>
  );
}
