import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BarChart3, BookOpen, CheckCircle2, ChevronDown, ChevronLeft, ClipboardCheck, FileDown, FileText, Headphones, Home, Loader2, LogOut, Menu, MessageCircle, PlayCircle, Settings, Sparkles, CircleUser as UserCircle, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { PdfViewer } from '../components/ui/PdfViewer';
import { fetchLatestSubscriptionRequest, getPackageDetails, isDashboardEligible, type StudentPackageDetails, type StudentSubscriptionRequest, type SubscriptionRequestStatus } from '../lib/subscriptionApi';
import { fetchUnitsWithLessons, type ContentLesson, type LessonResource, type UnitWithLessons } from '../lib/contentApi';

const STATUS_LABEL: Record<SubscriptionRequestStatus, string> = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'غير مقبول',
};

const STATUS_STYLE: Record<SubscriptionRequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

type LessonItem = ContentLesson;

type Unit = UnitWithLessons;

export function StudentDashboardPage() {
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<StudentSubscriptionRequest | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
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
      const [req, unitsData] = await Promise.all([
        fetchLatestSubscriptionRequest(user.id),
        fetchUnitsWithLessons(),
      ]);
      setRequest(req);
      setUnits(unitsData);
    } catch {
      setError('تعذّر تحميل بياناتك. حاول مرة أخرى.');
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
      <DashboardFrame>
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
        </div>
      </DashboardFrame>
    );
  }

  if (!user) {
    return <DashboardFrame><EmptyState title="يجب تسجيل الدخول" text="سجّل الدخول للوصول إلى لوحة التحكم الخاصة بك." action="تسجيل الدخول" to="/login" /></DashboardFrame>;
  }

  if (!isDashboardEligible(request)) {
    return <DashboardFrame onLogout={handleLogout} userName={profile?.fullName}><EmptyState title="لا يوجد اشتراك نشط" text="لم يتم العثور على طلب اشتراك ساري. تصفح الباقات المتاحة واشترك للحصول على لوحة التحكم." action="عرض الباقات" to="/#pricing" /></DashboardFrame>;
  }

  const packageDetails = getPackageDetails(request!);
  return (
    <DashboardFrame onLogout={handleLogout} userName={profile?.fullName}>
      <DashboardContent
        packageDetails={packageDetails}
        status={request!.status}
        userName={profile?.fullName}
        units={units}
        error={error}
        onRetry={load}
      />
    </DashboardFrame>
  );
}

function DashboardFrame({
  children,
  onLogout,
  userName,
}: {
  children: ReactNode;
  onLogout?: () => void;
  userName?: string | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-[#fbfaff] text-[#17154f]">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-[252px] border-l border-[#ece9fb] bg-white lg:flex lg:flex-col">
          <Sidebar userName={userName} onLogout={onLogout} />
        </aside>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" aria-label="إغلاق القائمة" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-[#17154f]/20 backdrop-blur-sm" />
            <aside className="absolute inset-y-0 right-0 flex w-[270px] max-w-[86vw] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ece9fb] px-5 py-5">
                <img src="/image.png" alt="Allef" className="h-9 w-auto" />
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-xl p-2 text-[#77739c] hover:bg-[#f6f3ff]" aria-label="إغلاق القائمة"><X className="h-5 w-5" /></button>
              </div>
              <Sidebar userName={userName} onLogout={onLogout} onNavigate={() => setMobileMenuOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col lg:mr-[252px]">
          <header className="sticky top-0 z-20 border-b border-[#ece9fb] bg-white/95 px-4 py-4 backdrop-blur sm:px-7 lg:px-10">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setMobileMenuOpen(true)} className="rounded-xl p-2 text-[#4e4a86] hover:bg-[#f6f3ff] lg:hidden" aria-label="فتح القائمة"><Menu className="h-5 w-5" /></button>
              <Link to="/" className="mr-auto flex items-center gap-2 text-sm font-bold text-[#5d4bc1] transition hover:text-[#452db0]"><ArrowLeft className="h-4 w-4" /> الرئيسية</Link>
              <img src="/image.png" alt="Allef" className="mr-4 h-8 w-auto lg:hidden" />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ userName, onLogout, onNavigate }: { userName?: string | null; onLogout?: () => void; onNavigate?: () => void }) {
  const mainItems = [
    { label: 'لوحة التحكم', icon: Home, active: true },
    { label: 'دروسي', icon: BookOpen },
    { label: 'الاختبارات', icon: ClipboardCheck },
    { label: 'الواجبات', icon: FileText },
    { label: 'متابعتي', icon: BarChart3 },
  ];
  const secondaryItems = [
    { label: 'الرسائل', icon: MessageCircle },
    { label: 'الإشعارات', icon: Bell },
    { label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
      <Link to="/" onClick={onNavigate} className="mb-7 flex items-center justify-center border-b border-[#f0eef9] pb-5"><img src="/image.png" alt="Allef" className="h-10 w-auto" /></Link>
      <nav className="flex flex-1 flex-col gap-1">
        {mainItems.map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-[#f0ebff] text-[#5834c6]' : 'text-[#595681] hover:bg-[#faf8ff] hover:text-[#5834c6]'}`}>
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
        <div className="my-5 border-t border-[#ebe8f6]" />
        {secondaryItems.map(({ label, icon: Icon }) => (
          <button key={label} type="button" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#595681] transition hover:bg-[#faf8ff] hover:text-[#5834c6]">
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-7 rounded-2xl border border-[#e9e1ff] bg-[#fbf8ff] p-4 text-center">
        <Headphones className="mx-auto h-7 w-7 text-[#6648d2]" />
        <p className="mt-2 text-sm font-extrabold text-[#332b75]">محتاج مساعدة؟</p>
        <p className="mt-1 text-xs leading-relaxed text-[#77739c]">تواصل معنا وسنساعدك</p>
        <button type="button" onClick={onNavigate} className="mt-3 w-full rounded-xl bg-[#eee6ff] py-2 text-xs font-extrabold text-[#5b38c4] transition hover:bg-[#e4d9ff]">تواصل الآن</button>
      </div>
      {onLogout && (
        <button type="button" onClick={onLogout} className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#8b87a5] hover:text-red-600"><LogOut className="h-4 w-4" /> تسجيل الخروج</button>
      )}
      {userName && <p className="mt-2 truncate px-4 text-center text-[11px] text-[#9a96b0]">{userName}</p>}
    </div>
  );
}

function DashboardContent({ packageDetails, status, userName, units, error, onRetry }: { packageDetails: StudentPackageDetails; status: SubscriptionRequestStatus; userName?: string | null; units: Unit[]; error: string | null; onRetry: () => void }) {
  const [activeUnit, setActiveUnit] = useState(0);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const unit = units[activeUnit];
  const firstName = userName?.trim().split(' ')[0] || 'صديقي';

  useEffect(() => {
    if (units.length > 0 && units[activeUnit]?.lessons[0]) {
      setOpenLesson(units[activeUnit].lessons[0].id);
    } else {
      setOpenLesson(null);
    }
  }, [activeUnit, units]);

  return (
    <div className="mx-auto max-w-5xl">
      {error && <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><span>{error}</span><button type="button" onClick={onRetry} className="underline">إعادة المحاولة</button></div>}
      <section className="mb-7 flex flex-col-reverse items-center justify-between gap-5 sm:flex-row sm:items-start">
        <div className="w-full text-right sm:pt-4">
          <p className="text-sm font-bold text-[#7c78a2]">مرحباً بعودتك</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#17154f] sm:text-4xl">مرحباً {firstName}! <span className="text-[#f5a832]">👋</span></h1>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#77739c]">كل يوم خطوة جديدة نحو هدفك، شدّي حيلك وكمّلي! <span className="text-[#a275ef]">♥</span></p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e8e1fa] bg-white px-3 py-1.5 text-xs font-bold text-[#6858aa]"><Sparkles className="h-3.5 w-3.5" />{packageDetails.name}</div>
        </div>
        <div className="relative hidden h-36 w-64 shrink-0 overflow-hidden rounded-2xl border border-[#e1d7ff] bg-gradient-to-br from-[#f5eeff] to-[#fafbff] sm:block">
          <div className="absolute -bottom-8 -left-6 h-32 w-32 rounded-full bg-[#d9c2ff]/50" />
          <div className="absolute right-5 top-7 text-right"><p className="text-lg font-black text-[#633bd0]">أنتِ قدها!</p><p className="mt-1 text-xs font-bold leading-relaxed text-[#5d5886]">المحاولة المستمرة<br />هي سر النجاح.</p></div>
          <Sparkles className="absolute bottom-6 left-8 h-9 w-9 text-[#a678ed]" />
        </div>
      </section>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<BookOpen />} iconClass="bg-orange-50 text-orange-500" label="الدروس المكتملة" value="3" detail="من 12 درس" />
        <StatCard icon={<CheckCircle2 />} iconClass="bg-emerald-50 text-emerald-500" label="الاختبارات" value="2" detail="اختبار" />
        <StatCard icon={<FileText />} iconClass="bg-blue-50 text-blue-500" label="الواجبات" value="1" detail="مهمة" />
        <StatCard icon={<BarChart3 />} iconClass="bg-violet-50 text-violet-500" label="نسبة التقدم" value="42%" detail="" progress />
      </div>

      <section className="rounded-3xl border border-[#e9e6f5] bg-white shadow-[0_8px_30px_rgba(73,52,145,0.04)]">
        <div className="flex items-center justify-between border-b border-[#eeebf8] px-5 py-4 sm:px-7"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-[#6941d3]" /><h2 className="text-lg font-black text-[#211b60]">دروسي</h2></div><span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span></div>
        {units.length === 0 ? <div className="px-5 py-12 text-center text-sm font-bold text-[#9793ad]">لا توجد وحدات منشورة بعد.</div> : <>
        <div className="flex overflow-x-auto border-b border-[#eeebf8] px-3 sm:px-6">{units.map((item, index) => <button key={item.id} type="button" onClick={() => setActiveUnit(index)} className={`relative min-w-[112px] px-3 py-4 text-sm font-extrabold transition sm:min-w-[150px] ${activeUnit === index ? 'text-[#6941d3]' : 'text-[#8e8aa5] hover:text-[#6941d3]'}`}>{item.title}{activeUnit === index && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#7040db]" />}</button>)}</div>
        <div className="p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="text-base font-black text-[#272061]">{unit.title}</h3><p className="mt-1 text-xs font-bold text-[#9793ad]">{unit.lessons.length} دروس</p></div></div><div className="flex flex-col gap-2">{unit.lessons.map((lesson) => <LessonAccordion key={lesson.id} lesson={lesson} open={openLesson === lesson.id} onToggle={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)} />)}</div></div>
        </>}
      </section>
      <div className="mt-5 flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-l from-[#eee6ff] to-[#faf8ff] px-5 py-4 text-center text-sm font-bold text-[#68618f]"><span className="text-xl text-[#7651d5]">“</span> توقفي عندما تتعبي، توقفي عندما تنتهي... أنتِ أقرب مما تتخيلي! <span className="text-xl text-[#7651d5]">”</span></div>
    </div>
  );
}

function StatCard({ icon, iconClass, label, value, detail, progress }: { icon: ReactNode; iconClass: string; label: string; value: string; detail: string; progress?: boolean }) {
  return <div className="rounded-2xl border border-[#e9e6f5] bg-white p-4 shadow-[0_5px_20px_rgba(73,52,145,0.03)]"><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-bold text-[#8d89a5]">{label}</p><p className="mt-2 text-2xl font-black text-[#191650]">{value}</p><p className="mt-1 text-[11px] font-bold text-[#aaa6ba]">{detail}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClass}`}>{icon}</span></div>{progress && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ebe8f4]"><div className="h-full w-[42%] rounded-full bg-[#7441e4]" /></div>}</div>;
}

function LessonAccordion({ lesson, open, onToggle }: { lesson: LessonItem; open: boolean; onToggle: () => void }) {
  return <div className="overflow-hidden rounded-2xl border border-[#e7e3f3] bg-white"><button type="button" onClick={onToggle} className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition ${open ? 'bg-[#f4efff]' : 'hover:bg-[#fbfaff]'}`}><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7040db] text-white"><BookOpen className="h-4 w-4" /></span><span className="text-sm font-extrabold text-[#282263]">الدرس {lesson.lesson_order}: {lesson.title}</span></span>{open ? <ChevronDown className="h-4 w-4 text-[#7040db]" /> : <ChevronLeft className="h-4 w-4 text-[#8c88a6]" />}</button>{open && <LessonContent lesson={lesson} />}</div>;
}

interface DisplayResource {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  url: string;
}

function buildResources(lesson: LessonItem): DisplayResource[] {
  const resources: DisplayResource[] = [];
  const seen = new Set<string>();

  for (const r of lesson.lesson_resources ?? []) {
    const key = `${r.resource_type}:${r.url}`;
    if (!seen.has(key)) {
      seen.add(key);
      resources.push({ id: r.id, type: r.resource_type, title: r.title, url: r.url });
    }
  }

  if (lesson.video_url && !seen.has(`video:${lesson.video_url}`)) {
    resources.unshift({ id: 'legacy-video', type: 'video', title: 'فيديو الشرح', url: lesson.video_url });
  }
  if (lesson.pdf_url && !seen.has(`pdf:${lesson.pdf_url}`)) {
    const videoIdx = resources.findIndex((r) => r.type === 'video');
    resources.splice(videoIdx + 1, 0, { id: 'legacy-pdf', type: 'pdf', title: 'مذكرة الدرس', url: lesson.pdf_url });
  }

  return resources;
}

function LessonContent({ lesson }: { lesson: LessonItem }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const resources = buildResources(lesson);

  if (resources.length === 0) {
    return <div className="flex items-center justify-center gap-2 py-5 text-xs font-bold text-[#9691ad]">لا يوجد محتوى منشور لهذا الدرس بعد</div>;
  }

  return <div className="border-t border-[#eeeaf8] px-4 py-2">{resources.map((res) => {
    const isOpen = openId === res.id;
    const isVideo = res.type === 'video';
    return <div key={res.id}><LessonAction icon={isVideo ? <PlayCircle /> : <FileDown />} iconClass={isVideo ? 'bg-[#f0e8ff] text-[#6d3dda]' : 'bg-[#eaf9ed] text-[#27a454]'} title={res.title} subtitle={isVideo ? 'شرح بالفيديو' : 'ملف PDF'} action={isOpen ? 'إخفاء' : (isVideo ? 'مشاهدة' : 'عرض المذكرة')} actionClass={isVideo ? 'bg-[#f0e8ff] text-[#6c39d0]' : 'bg-[#e8f9ec] text-[#249e4b]'} onAction={() => setOpenId(isOpen ? null : res.id)} />{isOpen && (isVideo ? <VideoPlayer videoUrl={res.url} title={`الدرس ${lesson.lesson_order}: ${lesson.title} — ${res.title}`} onClose={() => setOpenId(null)} /> : <PdfViewer pdfUrl={res.url} title={`الدرس ${lesson.lesson_order}: ${lesson.title} — ${res.title}`} onClose={() => setOpenId(null)} />)}</div>;
  })}</div>;
}

function LessonAction({ icon, iconClass, title, subtitle, action, actionClass, onAction }: { icon: ReactNode; iconClass: string; title: string; subtitle: string; action: string; actionClass: string; onAction?: () => void }) {
  return <div className="flex items-center gap-3 border-b border-[#f0edf8] py-3 last:border-0"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-[#3c3672]">{title}</p><p className="mt-0.5 truncate text-[11px] font-semibold text-[#a09cb2]">{subtitle}</p></div><button type="button" onClick={onAction} className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-extrabold transition hover:brightness-95 ${actionClass}`}>{action}</button></div>;
}

function EmptyState({ title, text, action, to }: { title: string; text: string; action: string; to: string }) {
  return <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-[#e9e6f5] bg-white px-6 py-14 text-center shadow-sm"><UserCircle className="h-14 w-14 text-[#8b6be0]" /><h2 className="text-2xl font-black text-[#211b60]">{title}</h2><p className="text-sm leading-relaxed text-[#77739c]">{text}</p><Link to={to} className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#6840d4] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#5831c1]">{action}<ArrowLeft className="h-4 w-4" /></Link></div>;
}
