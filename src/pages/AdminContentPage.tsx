import { useState } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GripVertical,
  Info,
  Lightbulb,
  PlaySquare,
  Plus,
  Search,
  Settings,
  Upload,
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';

type Unit = {
  id: number;
  title: string;
  subtitle: string;
  lessons: number;
};

type Lesson = {
  id: number;
  title: string;
  status: 'منشور' | 'مسودة';
};

const UNITS: Unit[] = [
  { id: 1, title: 'الوحدة الأولى', subtitle: 'أساسيات البرمجة', lessons: 5 },
  { id: 2, title: 'الوحدة الثانية', subtitle: 'البرمجة باستخدام Python', lessons: 6 },
  { id: 3, title: 'الوحدة الثالثة', subtitle: 'هياكل البيانات', lessons: 4 },
  { id: 4, title: 'الوحدة الرابعة', subtitle: 'قواعد البيانات', lessons: 3 },
];

const LESSONS: Lesson[] = [
  { id: 1, title: 'ما هي البرمجة؟', status: 'منشور' },
  { id: 2, title: 'تاريخ البرمجة', status: 'منشور' },
  { id: 3, title: 'لغات البرمجة الأولى', status: 'منشور' },
  { id: 4, title: 'مكونات البرنامج', status: 'مسودة' },
  { id: 5, title: 'كيف يعمل الكمبيوتر؟', status: 'مسودة' },
];

const CONTENT_ACTIONS = [
  { label: 'إضافة فيديو', description: 'أضف رابط الفيديو من يوتيوب أو أي منصة أخرى', icon: PlaySquare, color: 'text-secondary', background: 'bg-secondary-50' },
  { label: 'إضافة PDF', description: 'أضف ملف PDF للمذكرة أو الشرح', icon: FileText, color: 'text-red-500', background: 'bg-red-50' },
  { label: 'إضافة تقييم', description: 'أضف أسئلة تقييم لفهم الطالب', icon: ClipboardCheck, color: 'text-emerald-600', background: 'bg-emerald-50' },
  { label: 'إضافة واجب', description: 'أضف واجب ليقوم الطالب بحله ورفعه', icon: Upload, color: 'text-amber-600', background: 'bg-amber-50' },
];

function AddButton({ children }: { children: string }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700">
      <Plus className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

export function AdminContentPage() {
  const [selectedUnitId, setSelectedUnitId] = useState(1);
  const [selectedLessonId, setSelectedLessonId] = useState(1);
  const selectedUnit = UNITS.find((unit) => unit.id === selectedUnitId) ?? UNITS[0];
  const selectedLesson = LESSONS.find((lesson) => lesson.id === selectedLessonId) ?? LESSONS[0];

  return (
    <AdminLayout title="المحتوى التعليمي" subtitle="إدارة الوحدات والدروس ومحتوى كل درس" wide>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-secondary-100 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-muted">المحتوى التعليمي</p>
            <h2 className="mt-1 text-lg font-extrabold text-primary">إدارة محتوى المنهج</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            آخر تحديث منذ 5 دقائق
          </div>
        </div>

        <div className="grid min-h-[680px] grid-cols-1 gap-4 lg:order-1" dir="rtl">
          <section className="order-1 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-3">
            <div className="flex items-center justify-between px-2 py-2">
              <h3 className="text-base font-extrabold text-primary">الوحدات</h3>
              <AddButton>إضافة وحدة</AddButton>
            </div>
            <div className="relative mt-2">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input type="search" placeholder="بحث عن وحدة..." className="w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 pr-9 pl-3 text-xs font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary" />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {UNITS.map((unit) => (
                <button key={unit.id} type="button" onClick={() => { setSelectedUnitId(unit.id); setSelectedLessonId(1); }} className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedUnit.id === unit.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                  <GripVertical className="h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-soft text-sm font-extrabold text-primary">{unit.lessons}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-primary">{unit.title}</span><span className="mt-1 block truncate text-[10px] font-bold text-muted">{unit.subtitle}</span></span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary-50/70 p-3 text-[10px] font-bold leading-relaxed text-secondary-700"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />يمكنك السحب والإفلات لتغيير ترتيب الوحدات</div>
          </section>

          <section className="order-2 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-2">
            <div className="flex items-center justify-between px-2 py-2">
              <div><h3 className="text-base font-extrabold text-primary">دروس {selectedUnit.title}</h3><p className="mt-1 text-[11px] font-bold text-muted">{selectedUnit.subtitle}</p></div>
              <AddButton>إضافة درس</AddButton>
            </div>
            <div className="relative mt-2">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input type="search" placeholder="بحث عن درس..." className="w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 pr-9 pl-3 text-xs font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary" />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {LESSONS.map((lesson) => (
                <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedLesson.id === lesson.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                  <GripVertical className="h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${selectedLesson.id === lesson.id ? 'bg-white text-secondary-700' : 'bg-soft text-primary'}`}>{lesson.id}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-primary">{lesson.title}</span><span className={`mt-1 block text-[10px] font-bold ${lesson.status === 'منشور' ? 'text-emerald-600' : 'text-amber-600'}`}><span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />{lesson.status}</span></span>
                </button>
              ))}
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-secondary-300 bg-secondary-50/30 p-4 text-xs font-extrabold text-secondary transition hover:bg-secondary-50"><Plus className="h-4 w-4" aria-hidden="true" />إضافة درس جديد</button>
            </div>
          </section>

          <section className="order-3 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-soft lg:grid-cols-[230px_280px_minmax(0,1fr)] ">
            <div className="border-b border-secondary-100 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div><div className="flex items-center gap-2 text-xs font-bold text-muted"><span>الوحدات</span><span>‹</span><span>{selectedUnit.title}: {selectedUnit.subtitle}</span><span>‹</span><span className="text-secondary">الدرس {selectedLesson.id}</span></div><h3 className="mt-4 text-xl font-extrabold text-primary">{selectedLesson.title}</h3><div className="mt-2 flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${selectedLesson.status === 'منشور' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{selectedLesson.status}</span><span className="text-xs font-bold text-muted">الترتيب: {selectedLesson.id}</span></div></div>
                <BookOpen className="mt-8 h-8 w-8 text-secondary-200" aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-center gap-6 border-b border-secondary-100 text-xs font-extrabold text-muted"><button type="button" className="relative flex items-center gap-2 border-b-2 border-secondary px-1 pb-3 text-secondary"><FolderOpen className="h-4 w-4" aria-hidden="true" />محتوى الدرس</button><button type="button" className="flex items-center gap-2 px-1 pb-3 transition hover:text-primary"><Info className="h-4 w-4" aria-hidden="true" />معلومات الدرس</button><button type="button" className="flex items-center gap-2 px-1 pb-3 transition hover:text-primary"><Settings className="h-4 w-4" aria-hidden="true" />إعدادات الدرس</button></div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-blue-700"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p>أضف المحتوى الذي تريد أن يظهر للطالب في هذا الدرس<br /><span className="font-semibold text-blue-600">يمكنك إضافة أي نوع من المحتوى أو أكثر حسب الحاجة</span></p></div>
              <div className="mt-4 flex flex-col gap-3">
                {CONTENT_ACTIONS.map(({ label, description, icon: Icon, color, background }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-secondary-100 px-3 py-3 transition hover:border-secondary-200 hover:bg-soft/30"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${background}`}><Icon className={`h-5 w-5 ${color}`} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-primary">{label.replace('إضافة ', '')}</p><p className="mt-1 truncate text-[11px] font-semibold text-muted">{description}</p></div><button type="button" className="shrink-0 rounded-lg bg-secondary-50 px-3 py-2 text-[11px] font-extrabold text-secondary transition hover:bg-secondary-100"><Plus className="ml-1 inline h-3 w-3" aria-hidden="true" />{label}</button></div>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-amber-800"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" /><p><span className="font-extrabold">ملاحظة</span><br /><span className="font-semibold">يمكنك ترك أي نوع من المحتوى فارغاً، سيظهر للطالب فقط ما تم نشره.</span></p></div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
