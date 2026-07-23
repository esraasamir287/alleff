import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthVisual } from '../components/auth/AuthVisual';
import { AuthSuccessNotice } from '../components/auth/AuthSuccessNotice';
import { FormInput } from '../components/form/FormInput';
import { PasswordInput } from '../components/form/PasswordInput';
import { Checkbox } from '../components/form/Checkbox';
import { ValidationMessage } from '../components/form/ValidationMessage';
import { Button } from '../components/ui/Button';
import { validateEmailOrPhone, validatePassword } from '../utils/validation';
import { login } from '../lib/authApi';
import { useAuth } from '../context/useAuth';

interface Errors {
  identifier?: string;
  password?: string;
}

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, needsProfileCompletion } = useAuth();

  const redirectPath = searchParams.get('redirect');
  const isExpired = searchParams.get('expired') === 'true';
  const isLoggedOut = searchParams.get('loggedout') === 'true';

  // Redirect already-authenticated users away from login (no flicker).
  useEffect(() => {
    if (loading || isLoggedOut) return;
    if (user) {
      const destination = redirectPath ? decodeURIComponent(redirectPath) : '/';
      navigate(destination, { replace: true });
    }
  }, [user, loading, isLoggedOut, redirectPath, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Errors = {
      identifier: validateEmailOrPhone(identifier),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setSubmitError(undefined);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSuccess(false);

    const result = await login({ identifier: identifier.trim(), password, rememberMe: remember });

    if (result.success) {
      setSuccess(true);
      const destination = redirectPath ? decodeURIComponent(redirectPath) : '/';
      setTimeout(() => navigate(destination, { replace: true }), 1200);
    } else {
      if (result.fieldErrors) {
        setErrors({
          identifier: result.fieldErrors.identifier,
          password: result.fieldErrors.password,
        });
      }
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
          title="تسجيل الدخول"
          subtitle="ادخل بياناتك للوصول إلى حسابك على المنصة."
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
            <AuthSuccessNotice message="تم تسجيل الدخول بنجاح." />
          ) : isLoggedOut ? (
            <AuthSuccessNotice message="تم تسجيل الخروج بنجاح." />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {isExpired && !submitError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5"
                >
                  <p className="text-sm font-bold text-amber-800">
                    انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.
                  </p>
                </div>
              )}

              {needsProfileCompletion && !submitError && !isExpired && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-secondary-200 bg-secondary-50 px-4 py-3.5"
                >
                  <p className="text-sm font-bold text-secondary-800">
                    يرجى استكمال بيانات حسابك بعد تسجيل الدخول.
                  </p>
                </div>
              )}

              <FormInput
                name="identifier"
                label="البريد الإلكتروني أو رقم الهاتف"
                type="text"
                inputMode="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={errors.identifier}
                errorId="identifier-error"
                required
                placeholder="example@email.com أو 01012345678"
              />

              <PasswordInput
                name="password"
                label="كلمة المرور"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                errorId="password-error"
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                required
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onChange={setRemember}
                  label={<span className="text-sm text-ink">تذكرني</span>}
                />
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-secondary transition-colors hover:text-secondary-800"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              {submitError && (
                <ValidationMessage>{submitError}</ValidationMessage>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={submitting} className="mt-2 w-full">
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    جارٍ تسجيل الدخول...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" aria-hidden="true" />
                    تسجيل الدخول
                  </>
                )}
              </Button>

              <p className="mt-2 text-center text-sm text-muted">
                ليس لديك حساب؟{' '}
                <Link to="/signup" className="font-bold text-secondary transition-colors hover:text-secondary-800">
                  أنشئ حسابًا جديدًا
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
