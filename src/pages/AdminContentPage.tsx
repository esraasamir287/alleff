import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GripVertical,
  Info,
  Lightbulb,
  Loader2,
  PlaySquare,
  Plus,
  Search,
  Settings,
  Upload,
  X,
  Save,
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import {
  fetchUnitsWithLessonCount,
  fetchLessonsByUnit,
  createUnit,
  createLesson,
  updateLessonContent,
  type ContentLesson,
  type LessonWithCount,
} from '../lib/contentApi';

type ModalState = 'closed' | 'addUnit' | 'addLesson';

function AddButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700">
      <Plus className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-secondary-100 bg-white p-6 shadow-soft-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-primary">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const INPUT_CLASS = 'w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 px-3 text-sm font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary';

export function AdminContentPage() {
  const [units, setUnits] = useState<LessonWithCount[]>([]);
  const [lessons, setLessons] = useState<ContentLesson[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>('closed');

  // form state
  const [unitTitle, setUnitTitle] = useState('');
  const [unitOrder, setUnitOrder] = useState('1');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // content editing state
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [contentSaving, setContentSaving] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnitsWithLessonCount();
      setUnits(data);
      if (data.length > 0 && !selectedUnitId) {
        setSelectedUnitId(data[0].id);
      } else if (data.length === 0) {
        setSelectedUnitId(null);
      }
    } catch {
      setError('تعذّر تحميل الوحدات. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId]);

  const loadLessons = useCallback(async () => {
    if (!selectedUnitId) {
      setLessons([]);
      return;
    }
    setLessonsLoading(true);
    try {
      const data = await fetchLessonsByUnit(selectedUnitId);
      setLessons(data);
      if (data.length > 0) {
        setSelectedLessonId(data[0].id);
      } else {
        setSelectedLessonId(null);
      }
    } catch {
      setError('تعذّر تحميل الدروس.');
    } finally {
      setLessonsLoading(false);
    }
  }, [selectedUnitId]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) ?? null;
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null;

  // sync content fields when lesson changes
  useEffect(() => {
    if (selectedLesson) {
      setVideoUrl(selectedLesson.video_url ?? '');
      setPdfUrl(selectedLesson.pdf_url ?? '');
      setContentSaved(false);
    } else {
      setVideoUrl('');
      setPdfUrl('');
    }
  }, [selectedLessonId, selectedLesson]);

  function openAddUnit() {
    setUnitTitle('');
    setUnitOrder(String(units.length + 1));
    setFormError(null);
    setModal('addUnit');
  }

  function openAddLesson() {
    if (!selectedUnitId) return;
    setLessonTitle('');
    setLessonOrder(String(lessons.length + 1));
    setFormError(null);
    setModal('addLesson');
  }

  async function handleSaveUnit() {
    setFormError(null);
    if (!unitTitle.trim()) { setFormError('يرجى إدخال عنوان الوحدة'); return; }
    const order = parseInt(unitOrder, 10);
    if (isNaN(order) || order < 1) { setFormError('ترتيب الوحدة يجب أن يكون رقمًا صحيحًا'); return; }

    setSaving(true);
    try {
      await createUnit(unitTitle.trim(), order);
      setModal('closed');
      await loadUnits();
    } catch {
      setFormError('تعذّر حفظ الوحدة. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLesson() {
    if (!selectedUnitId) return;
    setFormError(null);
    if (!lessonTitle.trim()) { setFormError('يرجى إدخال عنوان الدرس'); return; }
    const order = parseInt(lessonOrder, 10);
    if (isNaN(order) || order < 1) { setFormError('ترتيب الدرس يجب أن يكون رقمًا صحيحًا'); return; }

    setSaving(true);
    try {
      await createLesson(selectedUnitId, lessonTitle.trim(), order);
      setModal('closed');
      await loadLessons();
    } catch {
      setFormError('تعذّر حفظ الدرس. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveContent() {
    if (!selectedLessonId) return;
    setContentSaving(true);
    setContentSaved(false);
    try {
      await updateLessonContent(selectedLessonId, {
        video_url: videoUrl.trim() || null,
        pdf_url: pdfUrl.trim() || null,
      });
      setContentSaved(true);
      await loadLessons();
    } catch {
      setError('تعذّر حفظ محتوى الدرس.');
    } finally {
      setContentSaving(false);
    }
  }

  return (
    <AdminLayout title="المحتوى التعليمي" subtitle="إدارة الوحدات والدروس ومحتوى كل درس" wide>
      <div className="flex flex-col gap-5">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button type="button" onClick={() => { setError(null); void loadUnits(); }} className="mt-1 text-xs font-bold text-red-600 underline hover:text-red-800">إعادة المحاولة</button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-secondary-100 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-muted">المحتوى التعليمي</p>
            <h2 className="mt-1 text-lg font-extrabold text-primary">إدارة محتوى المنهج</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {units.length} وحدة
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
          </div>
        ) : (
          <div className="grid min-h-[680px] grid-cols-1 gap-4 lg:grid-cols-[230px_280px_minmax(0,1fr)]" dir="rtl">
            {/* Units column */}
            <section className="order-1 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-3">
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="text-base font-extrabold text-primary">الوحدات</h3>
                <AddButton onClick={openAddUnit}>إضافة وحدة</AddButton>
              </div>
              <div className="relative mt-2">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input type="search" placeholder="بحث عن وحدة..." className="w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 pr-9 pl-3 text-xs font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {units.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs font-bold text-muted">لا توجد وحدات بعد. اضغط «إضافة وحدة» للبدء.</p>
                ) : (
                  units.map((unit) => (
                    <button key={unit.id} type="button" onClick={() => { setSelectedUnitId(unit.id); setSelectedLessonId(null); }} className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedUnitId === unit.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                      <GripVertical className="h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-soft text-sm font-extrabold text-primary">{unit.lesson_count}</span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold text-primary">{unit.title}</span><span className="mt-1 block truncate text-[10px] font-bold text-muted">الترتيب: {unit.unit_order}</span></span>
                    </button>
                  ))
                )}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary-50/70 p-3 text-[10px] font-bold leading-relaxed text-secondary-700"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />يمكنك السحب والإفلات لتغيير ترتيب الوحدات</div>
            </section>

            {/* Lessons column */}
            <section className="order-2 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-2">
              <div className="flex items-center justify-between px-2 py-2">
                <div>
                  <h3 className="text-base font-extrabold text-primary">{selectedUnit ? `دروس ${selectedUnit.title}` : 'الدروس'}</h3>
                  <p className="mt-1 text-[11px] font-bold text-muted">{selectedUnit ? `الترتيب: ${selectedUnit.unit_order}` : 'اختر وحدة'}</p>
                </div>
                <AddButton onClick={openAddLesson}>إضافة درس</AddButton>
              </div>
              <div className="relative mt-2">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input type="search" placeholder="بحث عن درس..." className="w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 pr-9 pl-3 text-xs font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary" />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {lessonsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-secondary" aria-hidden="true" /></div>
                ) : lessons.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs font-bold text-muted">{selectedUnitId ? 'لا توجد دروس بعد. اضغط «إضافة درس» للبدء.' : 'اختر وحدة أولًا.'}</p>
                ) : (
                  lessons.map((lesson) => (
                    <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedLessonId === lesson.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                      <GripVertical className="h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${selectedLessonId === lesson.id ? 'bg-white text-secondary-700' : 'bg-soft text-primary'}`}>{lesson.lesson_order}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-primary">{lesson.title}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-muted">
                          {lesson.video_url && <><PlaySquare className="h-3 w-3 text-secondary" aria-hidden="true" />فيديو</>}
                          {lesson.pdf_url && <><FileText className="h-3 w-3 text-red-500" aria-hidden="true" />PDF</>}
                          {!lesson.video_url && !lesson.pdf_url && <span className="text-amber-600">لا يوجد محتوى</span>}
                        </span>
                      </span>
                    </button>
                  ))
                )}
                <button type="button" onClick={openAddLesson} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-secondary-300 bg-secondary-50/30 p-4 text-xs font-extrabold text-secondary transition hover:bg-secondary-50"><Plus className="h-4 w-4" aria-hidden="true" />إضافة درس جديد</button>
              </div>
            </section>

            {/* Lesson content column */}
            <section className="order-3 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-soft lg:order-1">
              {selectedLesson ? (
                <>
                  <div className="border-b border-secondary-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted">
                          <span>الوحدات</span><span>‹</span><span>{selectedUnit?.title}</span><span>‹</span><span className="text-secondary">الدرس {selectedLesson.lesson_order}</span>
                        </div>
                        <h3 className="mt-4 text-xl font-extrabold text-primary">{selectedLesson.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-muted">الترتيب: {selectedLesson.lesson_order}</span>
                        </div>
                      </div>
                      <BookOpen className="mt-8 h-8 w-8 text-secondary-200" aria-hidden="true" />
                    </div>
                    <div className="mt-5 flex items-center gap-6 border-b border-secondary-100 text-xs font-extrabold text-muted">
                      <button type="button" className="relative flex items-center gap-2 border-b-2 border-secondary px-1 pb-3 text-secondary"><FolderOpen className="h-4 w-4" aria-hidden="true" />محتوى الدرس</button>
                      <button type="button" className="flex items-center gap-2 px-1 pb-3 transition hover:text-primary"><Info className="h-4 w-4" aria-hidden="true" />معلومات الدرس</button>
                      <button type="button" className="flex items-center gap-2 px-1 pb-3 transition hover:text-primary"><Settings className="h-4 w-4" aria-hidden="true" />إعدادات الدرس</button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-blue-700"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p>أضف المحتوى الذي تريد أن يظهر للطالب في هذا الدرس<br /><span className="font-semibold text-blue-600">يمكنك إضافة أي نوع من المحتوى أو أكثر حسب الحاجة</span></p></div>

                    {/* Video URL field */}
                    <div className="mt-4 rounded-xl border border-secondary-100 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-50"><PlaySquare className="h-5 w-5 text-secondary" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-primary">فيديو</p><p className="mt-1 text-[11px] font-semibold text-muted">رابط الفيديو (اختياري)</p></div>
                      </div>
                      <input type="url" dir="ltr" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setContentSaved(false); }} placeholder="https://..." className={`${INPUT_CLASS} mt-3 text-left`} />
                    </div>

                    {/* PDF URL field */}
                    <div className="mt-3 rounded-xl border border-secondary-100 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50"><FileText className="h-5 w-5 text-red-500" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-primary">PDF</p><p className="mt-1 text-[11px] font-semibold text-muted">رابط ملف PDF (اختياري)</p></div>
                      </div>
                      <input type="url" dir="ltr" value={pdfUrl} onChange={(e) => { setPdfUrl(e.target.value); setContentSaved(false); }} placeholder="https://..." className={`${INPUT_CLASS} mt-3 text-left`} />
                    </div>

                    {/* Placeholder action rows (quiz + homework — not implemented) */}
                    <div className="mt-3 flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-xl border border-secondary-100 px-3 py-3 opacity-60">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50"><ClipboardCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-primary">تقييم</p><p className="mt-1 truncate text-[11px] font-semibold text-muted">سيُضاف لاحقًا</p></div>
                        <span className="shrink-0 rounded-lg bg-secondary-50 px-3 py-2 text-[11px] font-extrabold text-muted">قريبًا</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-secondary-100 px-3 py-3 opacity-60">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50"><Upload className="h-5 w-5 text-amber-600" aria-hidden="true" /></span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-primary">واجب</p><p className="mt-1 truncate text-[11px] font-semibold text-muted">سيُضاف لاحقًا</p></div>
                        <span className="shrink-0 rounded-lg bg-secondary-50 px-3 py-2 text-[11px] font-extrabold text-muted">قريبًا</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-3">
                      {contentSaved && <span className="text-xs font-bold text-emerald-600">تم الحفظ</span>}
                      <button type="button" onClick={handleSaveContent} disabled={contentSaving} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60">
                        {contentSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                        حفظ المحتوى
                      </button>
                    </div>

                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-amber-800"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" /><p><span className="font-extrabold">ملاحظة</span><br /><span className="font-semibold">يمكنك ترك أي نوع من المحتوى فارغاً، سيظهر للطالب فقط ما تم نشره.</span></p></div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                  <BookOpen className="h-12 w-12 text-secondary-200" aria-hidden="true" />
                  <p className="text-base font-bold text-ink">{selectedUnitId ? 'اختر درسًا لعرض محتواه' : 'اختر وحدة ثم درسًا للبدء'}</p>
                  <p className="text-sm text-muted">ستظهر هنا تفاصيل ومحتوى الدرس المحدد.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      <Modal open={modal === 'addUnit'} onClose={() => setModal('closed')} title="إضافة وحدة جديدة">
        <div className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">عنوان الوحدة</label>
            <input type="text" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="مثال: الوحدة الأولى" className={INPUT_CLASS} autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">ترتيب الوحدة</label>
            <input type="number" min={1} value={unitOrder} onChange={(e) => setUnitOrder(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setModal('closed')} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
            <button type="button" onClick={handleSaveUnit} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              حفظ
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal open={modal === 'addLesson'} onClose={() => setModal('closed')} title={`إضافة درس جديد${selectedUnit ? ` — ${selectedUnit.title}` : ''}`}>
        <div className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">عنوان الدرس</label>
            <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="مثال: الدرس الأول" className={INPUT_CLASS} autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">ترتيب الدرس</label>
            <input type="number" min={1} value={lessonOrder} onChange={(e) => setLessonOrder(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setModal('closed')} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
            <button type="button" onClick={handleSaveLesson} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              حفظ
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
