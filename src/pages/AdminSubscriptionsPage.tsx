import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  Clock,
  ExternalLink,
  ImageOff,
  Loader2,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';
import { QuizLayout } from '../components/quiz/QuizLayout';

interface SubscriptionRequest {
  id: string;
  user_id: string;
  package_name: string;
  price: number;
  payment_method: string;
  receipt_path: string;
  status: string;
  student_name: string | null;
  created_at: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  instapay: 'InstaPay',
  vodafone_cash: 'Vodafone Cash',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض',
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminSubscriptionsPage() {
  const { user, loading, profileLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [urlLoadingId, setUrlLoadingId] = useState<string | null>(null);
  const [urlErrorId, setUrlErrorId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadRequests = useCallback(async () => {
    setFetching(true);
    setError(null);
    setForbidden(false);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('NO_SESSION');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-subscriptions`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        },
      );
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `REQUEST_FAILED_${res.status}`);
      }
      const json = await res.json();
      setRequests((json.data as SubscriptionRequest[]) ?? []);
    } catch {
      setError('تعذّر تحميل طلبات الاشتراك. حاول مرة أخرى.');
    } finally {
      setFetching(false);
    }
  }, []);

  // Always attempt to load once the session is restored. The edge function
  // is the authoritative admin check (reads app_metadata server-side), so we
  // don't gate on a possibly-stale client-side is_admin flag.
  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    if (!user) return;
    void loadRequests();
  }, [user, loading, profileLoading, loadRequests]);

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    navigate('/login?loggedout=true', { replace: true });
  }

  async function handleViewReceipt(req: SubscriptionRequest) {
    setUrlLoadingId(req.id);
    setUrlErrorId(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('NO_SESSION');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-subscriptions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ receiptPath: req.receipt_path }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `FAILED_${res.status}`);
      }
      const json = await res.json();
      const signedUrl = json?.data?.signedUrl as string | undefined;
      if (!signedUrl) throw new Error('NO_URL');
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      setUrlErrorId(req.id);
    } finally {
      setUrlLoadingId(null);
    }
  }

  if (loading || (user && profileLoading)) {
    return (
      <QuizLayout isAuthenticated={!!user} showAuth={false}>
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
        </div>
      </QuizLayout>
    );
  }

  if (forbidden) {
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
        </div>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout isAuthenticated userName={user.email} showAuth={false}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              لوحة المشرف
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">
              طلبات الاشتراك
            </h1>
            <p className="mt-2 text-sm text-muted">
              مراجعة طلبات الاشتراك وعرض إيصالات التحويل.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-soft hover:text-primary disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{signingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}</span>
          </button>
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

        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-secondary-100 bg-white px-6 py-16 text-center shadow-soft">
            <ImageOff className="h-12 w-12 text-secondary-200" aria-hidden="true" />
            <p className="text-base font-bold text-ink">لا توجد طلبات اشتراك حتى الآن</p>
            <p className="text-sm text-muted">ستظهر هنا طلبات الطلاب فور إرسالها.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-secondary-100 bg-white shadow-soft">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-right">
                <thead className="border-b border-secondary-100 bg-soft/50">
                  <tr className="text-xs font-bold uppercase text-muted">
                    <th className="px-4 py-3">الطالب</th>
                    <th className="px-4 py-3">الباقة</th>
                    <th className="px-4 py-3">السعر</th>
                    <th className="px-4 py-3">طريقة الدفع</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3 text-center">الإيصال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="text-sm hover:bg-soft/30">
                      <td className="px-4 py-4 font-bold text-ink">
                        {req.student_name || '—'}
                      </td>
                      <td className="px-4 py-4 text-ink">{req.package_name}</td>
                      <td className="px-4 py-4 font-extrabold text-secondary-700">
                        {req.price} جنيه
                      </td>
                      <td className="px-4 py-4 text-ink">
                        {PAYMENT_LABELS[req.payment_method] ?? req.payment_method}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ViewReceiptButton
                          req={req}
                          loading={urlLoadingId === req.id}
                          error={urlErrorId === req.id}
                          onClick={() => handleViewReceipt(req)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-secondary-50 md:hidden">
              {requests.map((req) => (
                <div key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-extrabold text-ink">
                        {req.student_name || 'طالب'}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">{req.package_name}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted">السعر</dt>
                      <dd className="font-extrabold text-secondary-700">{req.price} جنيه</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">طريقة الدفع</dt>
                      <dd className="font-bold text-ink">
                        {PAYMENT_LABELS[req.payment_method] ?? req.payment_method}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted">التاريخ</dt>
                      <dd className="font-bold text-ink">{formatDate(req.created_at)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">
                    <ViewReceiptButton
                      req={req}
                      loading={urlLoadingId === req.id}
                      error={urlErrorId === req.id}
                      onClick={() => handleViewReceipt(req)}
                      full
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </QuizLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-secondary-100 text-secondary-700 border-secondary-200';
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${cls}`}
    >
      {status === 'approved' ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : status === 'rejected' ? (
        <X className="h-3 w-3" aria-hidden="true" />
      ) : (
        <Clock className="h-3 w-3" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

function ViewReceiptButton({
  req,
  loading,
  error,
  onClick,
  full,
}: {
  req: SubscriptionRequest;
  loading: boolean;
  error: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <div className={full ? 'flex flex-col items-stretch gap-1' : 'flex flex-col items-center gap-1'}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-secondary px-3 py-1.5 text-xs font-bold text-secondary transition-colors hover:bg-secondary hover:text-white disabled:opacity-60 disabled:pointer-events-none"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        عرض الإيصال
      </button>
      {error && (
        <span className="text-[10px] font-bold text-red-600">تعذّر فتح الإيصال</span>
      )}
    </div>
  );
}
