import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';
import { AuthFooter } from '../components/auth/AuthFooter';
import { AuthVisual } from '../components/auth/AuthVisual';

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-secondary-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AuthHeader />
        </div>
      </div>

      <main className="flex-1">
        <AuthLayout
          title="نسيت كلمة المرور؟"
          subtitle="استعادة كلمة المرور ستتوفر قريبًا."
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
          <div className="flex flex-col gap-5">
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-secondary-100 bg-soft px-4 py-4"
            >
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <p className="text-sm font-bold leading-relaxed text-primary">
                استعادة كلمة المرور ستتوفر قريبًا.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-secondary transition-colors hover:text-secondary-800"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              العودة إلى تسجيل الدخول
            </Link>
          </div>
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
