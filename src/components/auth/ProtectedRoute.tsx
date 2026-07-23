import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, WifiOff, LogOut } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  /** When false, only authentication is required — profile completion is not enforced. */
  requireProfileComplete?: boolean;
}

export function ProtectedRoute({ children, requireProfileComplete = true }: ProtectedRouteProps) {
  const {
    user,
    loading,
    profileLoading,
    authError,
    needsProfileCompletion,
    retryProfile,
    logout,
  } = useAuth();
  const location = useLocation();

  // Wait for session restore AND profile load before any routing decision.
  if (loading || (user && profileLoading)) {
    return <AuthLoadingScreen />;
  }

  // No session — redirect to login, preserving the original destination.
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    const expiredParam = authError === 'expired' ? '&expired=true' : '';
    return <Navigate to={`/login?redirect=${redirect}${expiredParam}`} replace />;
  }

  // Session valid but profile couldn't be loaded — temporary network issue.
  if (authError === 'network' && !profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <WifiOff className="h-7 w-7 text-red-500" aria-hidden="true" />
          </span>
          <p className="text-base font-bold text-primary">
            تعذر التحقق من جلسة الدخول حاليًا. يرجى التحقق من الاتصال والمحاولة مرة أخرى.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retryProfile}
              className="inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            >
              <Loader2 className="h-4 w-4" aria-hidden="true" />
              إعادة المحاولة
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border-2 border-secondary px-6 py-3 text-sm font-bold text-secondary transition-all hover:bg-secondary hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile loaded but study_system is null — redirect to profile completion.
  // Only enforced when requireProfileComplete is true (default). The
  // profile-completion page itself uses requireProfileComplete={false}.
  if (requireProfileComplete && needsProfileCompletion) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
