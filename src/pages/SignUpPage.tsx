import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthVisual } from '../components/auth/AuthVisual';
import { AuthSuccessNotice } from '../components/auth/AuthSuccessNotice';
import { FormInput } from '../components/form/FormInput';
import { PasswordInput } from '../components/form/PasswordInput';
import { SelectInput } from '../components/form/SelectInput';
import { SearchableGovernorateSelect } from '../components/form/SearchableGovernorateSelect';
import { Checkbox } from '../components/form/Checkbox';
import { StudySystemSelect, type StudySystemValue } from '../components/form/StudySystemSelect';
import { ValidationMessage } from '../components/form/ValidationMessage';
import { Button } from '../components/ui/Button';
import {
  validateRequired,
  validateEgyptianPhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateStudySystem,
} from '../utils/validation';
import { authMessages } from '../data/authConstants';
import { gradeOptions } from '../data/gradeOptions';
import { signUp } from '../lib/authApi';
import { useAuth } from '../context/useAuth';

interface Errors {
  fullName?: string;
  phone?: string;
  email?: string;
  grade?: string;
  governorate?: string;
  studySystem?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [studySystem, setStudySystem] = useState<StudySystemValue | ''>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect already-authenticated users away from signup (no flicker).
  useEffect(() => {
    if (loading) return;
    if (user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Errors = {
      fullName: validateRequired(fullName),
      phone: validateEgyptianPhone(phone),
      email: validateEmail(email),
      grade: grade ? undefined : authMessages.required,
      governorate: governorate ? undefined : authMessages.required,
      studySystem: validateStudySystem(studySystem),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
      terms: terms ? undefined : authMessages.termsRequired,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSuccess(false);
    setSubmitError(undefined);

    const result = await signUp({
      fullName: fullName.trim(),
      phone,
      email,
      academicGrade: grade,
      governorate,
      studySystem: studySystem as StudySystemValue,
      password,
      confirmPassword,
      acceptedTerms: terms,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } else {
      const backendErrors = result.fieldErrors ?? {};
      const merged: Errors = {
        fullName: backendErrors.fullName,
        phone: backendErrors.phone,
        email: backendErrors.email,
        grade: backendErrors.academicGrade,
        governorate: backendErrors.governorate,
        studySystem: backendErrors.studySystem,
        password: backendErrors.password,
        confirmPassword: backendErrors.confirmPassword,
        terms: backendErrors.acceptedTerms,
      };
      setErrors(merged);
      setSubmitError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-secondary-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AuthHeader />
        </div>
      </div>

      <main className="flex-1">
        <AuthLayout
          title="إنشاء حساب جديد"
          subtitle="أنشئ حسابك للانضمام إلى منصة Allef للبرمجة والذكاء الاصطناعي."
          visual={
            <>
              <div className="lg:hidden">
                <AuthVisual variant="compact" />
              </div>
              <div className="hidden lg:block">
                <AuthVisual variant="full" />
              </div>
            </>
          }
        >
          {success ? (
            <AuthSuccessNotice message="تم إنشاء حسابك بنجاح. جارٍ تحويلك..." />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                placeholder="مثال: أحمد محمد علي"
              />

              <FormInput
                name="phone"
                label="رقم هاتف الطالب"
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

              <SelectInput
                name="grade"
                label="الصف الدراسي"
                options={gradeOptions}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                error={errors.grade}
                errorId="grade-error"
                required
                placeholder="اختر الصف الدراسي"
              />

              <SearchableGovernorateSelect
                name="governorate"
                label="المحافظة"
                value={governorate}
                onChange={setGovernorate}
                error={errors.governorate}
                errorId="governorate-error"
                required
              />

              <StudySystemSelect
                name="studySystem"
                label="نظام الدراسة"
                value={studySystem}
                onChange={(v) => setStudySystem(v)}
                error={errors.studySystem}
                errorId="studySystem-error"
                required
              />

              <PasswordInput
                name="password"
                label="كلمة المرور"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                errorId="password-error"
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                required
                placeholder="8 أحرف على الأقل"
              />

              <PasswordInput
                name="confirmPassword"
                label="تأكيد كلمة المرور"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                errorId="confirmPassword-error"
                show={showConfirm}
                onToggleShow={() => setShowConfirm((v) => !v)}
                required
                placeholder="أعد كتابة كلمة المرور"
              />

              <Checkbox
                id="terms"
                checked={terms}
                onChange={setTerms}
                required
                error={errors.terms}
                errorId="terms-error"
                label={
                  <span className="text-sm leading-relaxed text-ink">
                    أوافق على{' '}
                    <a href="#" className="font-bold text-secondary hover:underline">
                      الشروط والأحكام
                    </a>{' '}
                    و{' '}
                    <a href="#" className="font-bold text-secondary hover:underline">
                      سياسة الخصوصية
                    </a>
                  </span>
                }
              />

              {submitError && (
                <ValidationMessage>{submitError}</ValidationMessage>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={submitting} className="mt-2 w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    جارٍ إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" aria-hidden="true" />
                    إنشاء حساب
                  </>
                )}
              </Button>

              <p className="mt-2 text-center text-sm text-muted">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-bold text-secondary transition-colors hover:text-secondary-800">
                  سجل الدخول
                </Link>
              </p>
            </form>
          )}
        </AuthLayout>
      </main>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AuthFooter />
        </div>
      </div>
    </div>
  );
}
