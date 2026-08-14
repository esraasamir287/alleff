import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ImageOff, Loader2, Users } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';
import { AdminLayout } from '../components/admin/AdminLayout';

interface StudentRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  academic_grade: string;
  study_system: string | null;
  governorate: string;
  created_at: string;
}

const GRADE_LABELS: Record<string, string> = {
  first: 'الأولى',
  second: 'الثانية',
  third: 'الثالثة',
};

const TRACK_LABELS: Record<string, string> = {
  arabic: 'عربي',
  languages: 'لغات',
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminStudentsPage() {
  const { user, loading, profileLoading } = useAuth();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const loadStudents = useCallback(async () => {
    setFetching(true);
    setError(null);
    setForbidden(false);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error('NO_SESSION');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-students`,
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
      setStudents((json.data as StudentRow[]) ?? []);
    } catch {
      setError('تعذّر تحميل بيانات الطلاب. حاول مرة أخرى.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading || (user && profileLoading)) return;
    if (!user) return;
    void loadStudents();
  }, [user, loading, profileLoading, loadStudents]);

  if (loading || (user && profileLoading)) {
    return (
      <AdminLayout title="الطلاب" subtitle="قائمة الطلاب المسجلين على المنصة">
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-100 border-t-secondary" aria-hidden="true" />
        </div>
      </AdminLayout>
    );
  }

  if (forbidden) {
    return (
      <AdminLayout title="الطلاب">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-secondary-100 bg-white px-6 py-12 text-center shadow-soft">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-extrabold text-primary">صفحة المشرف</h1>
          <p className="text-base leading-relaxed text-muted">
            هذه الصفحة مخصصة للمشرفين فقط. إذا كنت مشرفًا، تواصل مع مدير النظام لتفعيل صلاحية المشرف لحسابك.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="الطلاب" subtitle="قائمة الطلاب المسجلين على المنصة">
      <div className="flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button
                type="button"
                onClick={loadStudents}
                className="mt-1 text-xs font-bold text-red-600 underline hover:text-red-800"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-secondary-100 bg-white px-6 py-16 text-center shadow-soft">
            <ImageOff className="h-12 w-12 text-secondary-200" aria-hidden="true" />
            <p className="text-base font-bold text-ink">لا يوجد طلاب مسجلون حتى الآن</p>
            <p className="text-sm text-muted">ستظهر هنا بيانات الطلاب فور تسجيلهم.</p>
          </div>
        ) : (
          <>
            {/* Count badge */}
            <div className="flex items-center gap-2 rounded-2xl border border-secondary-100 bg-white px-4 py-3 shadow-soft">
              <Users className="h-5 w-5 text-secondary" aria-hidden="true" />
              <span className="text-sm font-bold text-ink">
                إجمالي الطلاب: <span className="text-secondary-700">{students.length}</span>
              </span>
            </div>

            <div className="overflow-hidden rounded-3xl border border-secondary-100 bg-white shadow-soft">
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-right">
                  <thead className="border-b border-secondary-100 bg-soft/50">
                    <tr className="text-xs font-bold uppercase text-muted">
                      <th className="px-4 py-3">الاسم</th>
                      <th className="px-4 py-3">الهاتف</th>
                      <th className="px-4 py-3">البريد الإلكتروني</th>
                      <th className="px-4 py-3">الصف</th>
                      <th className="px-4 py-3">المسار</th>
                      <th className="px-4 py-3">المحافظة</th>
                      <th className="px-4 py-3">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {students.map((s) => (
                      <tr key={s.id} className="text-sm hover:bg-soft/30">
                        <td className="px-4 py-4 font-bold text-ink">{s.full_name}</td>
                        <td className="px-4 py-4 text-ink" dir="ltr">{s.phone}</td>
                        <td className="px-4 py-4 text-muted" dir="ltr">{s.email}</td>
                        <td className="px-4 py-4 text-ink">
                          {GRADE_LABELS[s.academic_grade] ?? s.academic_grade}
                        </td>
                        <td className="px-4 py-4 text-ink">
                          {s.study_system ? (TRACK_LABELS[s.study_system] ?? s.study_system) : '—'}
                        </td>
                        <td className="px-4 py-4 text-ink">{s.governorate}</td>
                        <td className="px-4 py-4 text-xs text-muted">
                          {formatDate(s.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-secondary-50 md:hidden">
                {students.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-extrabold text-ink">{s.full_name}</p>
                      <span className="shrink-0 rounded-full bg-secondary-50 px-2.5 py-1 text-xs font-bold text-secondary-700">
                        {GRADE_LABELS[s.academic_grade] ?? s.academic_grade}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">الهاتف</dt>
                        <dd className="font-bold text-ink" dir="ltr">{s.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">المسار</dt>
                        <dd className="font-bold text-ink">
                          {s.study_system ? (TRACK_LABELS[s.study_system] ?? s.study_system) : '—'}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted">البريد الإلكتروني</dt>
                        <dd className="font-bold text-ink" dir="ltr">{s.email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">المحافظة</dt>
                        <dd className="font-bold text-ink">{s.governorate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">تاريخ التسجيل</dt>
                        <dd className="font-bold text-ink">{formatDate(s.created_at)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
