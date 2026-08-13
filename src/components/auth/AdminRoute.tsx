import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { QuizLayout } from '../quiz/QuizLayout';

const ADMIN_CHECK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth-check`;

type AdminStatus = 'checking' | 'admin' | 'forbidden';

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

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('checking');

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;
    setAdminStatus('checking');

    supabase.auth.getSession().then(({ data }) => {
      const token = data?.session?.access_token;
      if (!token || cancelled) {
        if (!cancelled) setAdminStatus('forbidden');
        return;
      }
      checkIsAdmin(token).then((isAdmin) => {
        if (!cancelled) setAdminStatus(isAdmin ? 'admin' : 'forbidden');
      });
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (loading) {
    return (
      <QuizLayout isAuthenticated={false} showAuth={false}>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" aria-hidden="true" />
        </div>
      </QuizLayout>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin?redirect=${redirect}`} replace />;
  }

  if (adminStatus === 'checking') {
    return (
      <QuizLayout isAuthenticated showAuth={false}>
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" aria-hidden="true" />
          <p className="text-sm font-bold text-muted">جارٍ التحقق من صلاحية المشرف...</p>
        </div>
      </QuizLayout>
    );
  }

  if (adminStatus === 'forbidden') {
    return (
      <QuizLayout isAuthenticated userName={user.email}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-secondary-100 bg-white px-6 py-12 text-center shadow-soft">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-extrabold text-primary">صفحة المشرف</h1>
          <p className="text-base leading-relaxed text-muted">
            هذه الصفحة مخصصة للمشرفين فقط. إذا كنت مشرفًا، تواصل مع مدير النظام لتفعيل صلاحية المشرف لحسابك.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full border-2 border-secondary px-6 py-3 text-sm font-bold text-secondary transition-all hover:bg-secondary hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </QuizLayout>
    );
  }

  return <>{children}</>;
}
