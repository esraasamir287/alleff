import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';
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
import { validateEmail, validatePassword } from '../utils/validation';
import { login } from '../lib/authApi';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/useAuth';

interface Errors {
  identifier?: string;
  password?: string;
}

const ADMIN_CHECK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth-check`;

async function checkIsAdmin(token: string): Promise<boolean> {
  const res = await fetch(ADMIN_CHECK_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { isAdmin?: boolean };
  return json.isAdmin === true;
}

export function AdminLoginPage() {
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
  const { user, loading, session } = useAuth();

  const redirectPath = searchParams.get('redirect') ?? '/admin/subscriptions';
  const isExpired = searchParams.get('expired') === 'true';

  // If an authenticated admin lands here, send them straight to the dashboard.
  // A signed-in student is kept on this page so they don't get sent to the
  // admin dashboard (the guard there will reject them anyway).
  useEffect(() => {
    if (loading || !user || !session) return;
    void checkIsAdmin(session.access_token).then((isAdmin) => {
      if (isAdmin) {
        navigate(redirectPath, { replace: true });
      }
    });
  }, [user, loading, session, redirectPath, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Errors = {
      identifier: validateEmail(identifier),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setSubmitError(undefined);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    setSuccess(false);

    const result = await login({ identifier: identifier.trim(), password, rememberMe: remember });

    if (!result.success) {
      if (result.fieldErrors) {
        setErrors({
          identifier: result.fieldErrors.identifier,
          password: result.fieldErrors.password,
        });
      }
      setSubmitError(result.message);
      setSubmitting(false);
      return;
    }

    // Login succeeded — now verify the account is actually an admin.
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      setSubmitError('تعذّر التحقق من صلاحية المشرف. حاول مرة أخرى.');
      setSubmitting(false);
      return;
    }

    const isAdmin = await checkIsAdmin(token);
    if (!isAdmin) {
      setSubmitError('هذا الحساب لا يملك صلاحية مشرف. تواصل مع مدير النظام.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate(redirectPath, { replace: true }), 900);
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
          title="تسجيل دخول المشرف"
          subtitle="ادخل بيانات المشرف للوصول إلى لوحة التحكم."
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
            <AuthSuccessNotice message="تم تسجيل الدخول بنجاح. جارٍ التحويل إلى لوحة التحكم..." />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-2xl border border-secondary-200 bg-secondary-50 px-4 py-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-secondary-600" aria-hidden="true" />
                <p className="text-sm font-bold text-secondary-800">
                  هذه الصفحة مخصصة للمشرفين فقط.
                </p>
              </div>

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

              <FormInput
                name="identifier"
                label="البريد الإلكتروني"
                type="email"
                inputMode="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={errors.identifier}
                errorId="identifier-error"
                required
                placeholder="admin@email.com"
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
                    جارٍ التحقق...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" aria-hidden="true" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
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
