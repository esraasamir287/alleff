import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  GraduationCap,
  Loader2,
  LogOut,
  Sparkles,
  Video,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';
import {
  fetchLatestSubscriptionRequest,
  getPackageDetails,
  isDashboardEligible,
  type StudentPackageDetails,
  type StudentSubscriptionRequest,
  type SubscriptionRequestStatus,
} from '../lib/subscriptionApi';

const STATUS_LABEL: Record<SubscriptionRequestStatus, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'غير مقبول',
};

const STATUS_STYLE: Record<SubscriptionRequestStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-400/30',
};

export function StudentDashboardPage() {
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<StudentSubscriptionRequest | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setFetching(false);
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const req = await fetchLatestSubscriptionRequest(user.id);
      setRequest(req);
    } catch {
      setError('تعذّر تحميل بيانات اشتراكك. حاول مرة أخرى.');
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    void load();
  }, [user, loading, profileLoading, load]);

  async function handleLogout() {
    await logout();
    navigate('/?loggedout=true');
  }

  if (loading || (user && profileLoading) || fetching) {
    return (
      <DashboardShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[#c7a5ff]" aria-hidden="true" />
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell>
        <NotLoggedIn />
      </DashboardShell>
    );
  }

  const eligible = isDashboardEligible(request);

  if (!eligible) {
    return (
      <DashboardShell onLogout={handleLogout} userName={profile?.fullName}>
        <NoSubscription />
      </DashboardShell>
    );
  }

  const pkg = getPackageDetails(request!);
  const status = request!.status;

  return (
    <DashboardShell onLogout={handleLogout} userName={profile?.fullName}>
      <div className="flex flex-col gap-6">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${STATUS_STYLE[status]}`}
        >
          {status === 'approved' ? (
            <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <p className="text-sm font-bold">
            {status === 'approved'
              ? 'اشتراكك مفعّل. ابدأ متابعة محاضراتك من هنا.'
              : 'تم استلام طلبك وإيصال الدفع. جارٍ مراجعة طلبك وسيتم تفعيل الاشتراك خلال 24 ساعة عمل.'}
          </p>
        </div>

        {/* Package card */}
        <PackageCard pkg={pkg} status={status} />

        {/* Lectures coming soon notice */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5c25cf]/30">
            <Video className="h-7 w-7 text-[#c7a5ff]" aria-hidden="true" />
          </div>
          <p className="mt-4 text-lg font-extrabold text-white">سوف يتم رفع المحاضرات قريباً</p>
          <p className="mt-1.5 text-sm text-white/60">المحتوى التعليمي قيد التجهيز وسيكون متاحاً هنا قريباً.</p>
        </div>
      </div>
    </DashboardShell>
  );
}

function DashboardShell({
  children,
  onLogout,
  userName,
}: {
  children: React.ReactNode;
  onLogout?: () => void;
  userName?: string | null;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0b37] text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#5c31c8]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#2f55cf]/20 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-white transition hover:opacity-80">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-bold">الرئيسية</span>
          </Link>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="hidden max-w-[120px] truncate text-sm font-bold text-white/80 sm:inline">
                {userName}
              </span>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                خروج
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#c7a5ff]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Allef
          </span>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">لوحة التحكم</h1>
        </div>
        {children}
      </main>
    </div>
  );
}

function PackageCard({
  pkg,
  status,
}: {
  pkg: StudentPackageDetails;
  status: SubscriptionRequestStatus;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.06] backdrop-blur-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5c25cf] shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-black text-white">{pkg.name}</h2>
            <p className="text-xs text-white/60">باقتك المشترك بها</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${STATUS_STYLE[status]}`}
        >
          {status === 'approved' ? (
            <Check className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Clock className="h-3 w-3" aria-hidden="true" />
          )}
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
        <DetailCell icon={<GraduationCap className="h-5 w-5" />} label="الصف" value={pkg.grade} />
        <DetailCell icon={<BookOpen className="h-5 w-5" />} label="المسار" value={pkg.track} />
        <DetailCell icon={<CalendarDays className="h-5 w-5" />} label="المدة" value={pkg.duration} />
        <DetailCell
          icon={<Sparkles className="h-5 w-5" />}
          label="السعر"
          value={`${pkg.price} جنيه`}
        />
      </div>

      {/* Features */}
      <div className="border-t border-white/10 px-6 py-5">
        <h3 className="text-sm font-bold text-white/80">المميزات</h3>
        <ul className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm font-bold text-white/90">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5423c9]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DetailCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-[#0d0b37] px-3 py-5 text-center">
      <span className="text-[#c7a5ff]">{icon}</span>
      <span className="text-xs font-bold text-white/60">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function NoSubscription() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[#c7a5ff]">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="text-2xl font-black text-white">لا يوجد اشتراك نشط</h2>
      <p className="text-sm leading-relaxed text-white/60">
        لم يتم العثور على طلب اشتراك ساري. تصفح الباقات المتاحة واشترك للحصول على لوحة التحكم.
      </p>
      <Link
        to="/#pricing"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#5c25cf] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#6c32df]"
      >
        عرض الباقات
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[#c7a5ff]">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h2 className="text-2xl font-black text-white">يجب تسجيل الدخول</h2>
      <p className="text-sm leading-relaxed text-white/60">
        سجّل الدخول للوصول إلى لوحة التحكم الخاصة بك.
      </p>
      <Link
        to="/login"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#5c25cf] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#6c32df]"
      >
        تسجيل الدخول
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
