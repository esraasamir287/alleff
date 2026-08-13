import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';

interface AdminStats {
  totalStudents: number;
  subscriptionRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  quizAttempts: number;
  passedAttempts: number;
  activeSubscriptions: number;
}

const STATS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`;

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Users;
  iconBg: string;
  iconColor: string;
  accentRing: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, accentRing }: StatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft transition-all hover:shadow-soft-lg sm:p-6 ${accentRing}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-muted">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">{value.toLocaleString('ar-EG')}</p>
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function AdminHomePage() {
  const { user, loading, profileLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('NO_SESSION');

      const res = await fetch(STATS_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `REQUEST_FAILED_${res.status}`);
      }
      const json = await res.json();
      setStats(json.data as AdminStats);
    } catch {
      setError('تعذّر تحميل الإحصائيات. حاول مرة أخرى.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    if (!user) return;
    void loadStats();
  }, [user, loading, profileLoading, loadStats]);

  if (loading || (user && profileLoading)) {
    return (
      <AdminLayout title="الرئيسية" subtitle="نظرة عامة على نشاط المنصة">
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الرئيسية" subtitle="نظرة عامة على نشاط المنصة">
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadStats}
              className="mt-1 text-xs font-bold text-red-600 underline hover:text-red-800"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-6">
          {/* Main stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="إجمالي الطلاب"
              value={stats.totalStudents}
              icon={Users}
              iconBg="bg-primary-50"
              iconColor="text-primary"
              accentRing=""
            />
            <StatCard
              label="طلبات الاشتراك"
              value={stats.subscriptionRequests.total}
              icon={ClipboardList}
              iconBg="bg-secondary-50"
              iconColor="text-secondary"
              accentRing=""
            />
            <StatCard
              label="الاختبارات المنجزة"
              value={stats.quizAttempts}
              icon={TrendingUp}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              accentRing=""
            />
          </div>

          {/* Subscription breakdown */}
          <div className="rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-primary">طلبات الاشتراك</h2>
                <p className="text-sm text-muted">تفصيل حسب الحالة</p>
              </div>
              <Link
                to="/admin/subscriptions"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-secondary px-4 py-2 text-xs font-bold text-secondary transition-colors hover:bg-secondary hover:text-white"
              >
                عرض الكل
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-amber-700">{stats.subscriptionRequests.pending}</p>
                  <p className="text-xs font-bold text-amber-600">قيد المراجعة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-green-700">{stats.subscriptionRequests.approved}</p>
                  <p className="text-xs font-bold text-green-600">مقبول</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-red-700">{stats.subscriptionRequests.rejected}</p>
                  <p className="text-xs font-bold text-red-600">مرفوض</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <Award className="h-6 w-6 text-accent-dark" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-primary">{stats.passedAttempts}</p>
                <p className="text-xs font-bold text-muted">اختبارات ناجحة</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50">
                <GraduationCap className="h-6 w-6 text-secondary" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-primary">{stats.activeSubscriptions}</p>
                <p className="text-xs font-bold text-muted">اشتراكات نشطة</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-secondary-100 bg-white p-5 shadow-soft">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-primary">
                  {stats.quizAttempts > 0
                    ? Math.round((stats.passedAttempts / stats.quizAttempts) * 100)
                    : 0}
                  ٪
                </p>
                <p className="text-xs font-bold text-muted">نسبة النجاح</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
