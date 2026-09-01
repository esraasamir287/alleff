import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Eye,
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
  Trash2,
  Upload,
  X,
  Save,
} from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { PdfViewer } from '../components/ui/PdfViewer';
import {
  fetchUnitsWithLessonCount,
  fetchLessonsByUnit,
  createUnit,
  createLesson,
  addLessonResource,
  updateLessonResource,
  deleteLessonResource,
  type ContentLesson,
  type LessonResource,
  type LessonWithCount,
  type ResourceType,
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

interface ResourceDraft {
  id: string | null;
  resource_type: ResourceType;
  title: string;
  url: string;
  resource_order: number;
  isNew: boolean;
  dirty: boolean;
  saving: boolean;
}

function toDrafts(resources: LessonResource[]): ResourceDraft[] {
  return resources.map((r) => ({
    id: r.id,
    resource_type: r.resource_type,
    title: r.title,
    url: r.url,
    resource_order: r.resource_order,
    isNew: false,
    dirty: false,
    saving: false,
  }));
}

export function AdminContentPage() {
  const [units, setUnits] = useState<LessonWithCount[]>([]);
  const [lessons, setLessons] = useState<ContentLesson[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>('closed');

  const [unitTitle, setUnitTitle] = useState('');
  const [unitOrder, setUnitOrder] = useState('1');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<ResourceDraft[]>([]);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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

  useEffect(() => {
    if (selectedLesson) {
      setDrafts(toDrafts(selectedLesson.lesson_resources ?? []));
      setResourceError(null);
    } else {
      setDrafts([]);
    }
    setPreviewIndex(null);
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

  function addDraftRow(type: ResourceType) {
    setDrafts((prev) => [
      ...prev,
      {
        id: null,
        resource_type: type,
        title: type === 'video' ? 'فيديو الشرح' : 'مذكرة الدرس',
        url: '',
        resource_order: prev.length + 1,
        isNew: true,
        dirty: true,
        saving: false,
      },
    ]);
  }

  function updateDraft(index: number, fields: Partial<ResourceDraft>) {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, ...fields, dirty: true } : d)));
  }

  async function saveDraft(index: number) {
    if (!selectedLessonId) return;
    const draft = drafts[index];
    if (!draft) return;
    if (!draft.url.trim()) {
      setResourceError('يرجى إدخال رابط صحيح');
      return;
    }
    if (!draft.title.trim()) {
      setResourceError('يرجى إدخال عنوان للمحتوى');
      return;
    }

    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: true } : d)));
    setResourceError(null);

    try {
      if (draft.isNew || !draft.id) {
        const created = await addLessonResource(
          selectedLessonId,
          draft.resource_type,
          draft.title.trim(),
          draft.url.trim(),
          draft.resource_order,
        );
        setDrafts((prev) => prev.map((d, i) => (i === index ? {
          ...d,
          id: created.id,
          isNew: false,
          dirty: false,
          saving: false,
        } : d)));
      } else {
        await updateLessonResource(draft.id, {
          title: draft.title.trim(),
          url: draft.url.trim(),
        });
        setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, dirty: false, saving: false } : d)));
      }
      await loadLessons();
    } catch {
      setResourceError('تعذّر حفظ المحتوى. حاول مرة أخرى.');
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: false } : d)));
    }
  }

  async function deleteDraft(index: number) {
    const draft = drafts[index];
    if (!draft) return;

    if (!draft.id) {
      setDrafts((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: true } : d)));
    try {
      await deleteLessonResource(draft.id);
      setDrafts((prev) => prev.filter((_, i) => i !== index));
      await loadLessons();
    } catch {
      setResourceError('تعذّر حذف المحتوى. حاول مرة أخرى.');
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: false } : d)));
    }
  }

  const videoDrafts = drafts.filter((d) => d.resource_type === 'video');
  const pdfDrafts = drafts.filter((d) => d.resource_type === 'pdf');

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
                  lessons.map((lesson) => {
                    const resCount = lesson.lesson_resources?.length ?? 0;
                    const hasVideo = (lesson.lesson_resources ?? []).some((r) => r.resource_type === 'video') || !!lesson.video_url;
                    const hasPdf = (lesson.lesson_resources ?? []).some((r) => r.resource_type === 'pdf') || !!lesson.pdf_url;
                    return (
                      <button key={lesson.id} type="button" onClick={() => setSelectedLessonId(lesson.id)} className={`flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedLessonId === lesson.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                        <GripVertical className="h-4 w-4 shrink-0 text-secondary-300" aria-hidden="true" />
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${selectedLessonId === lesson.id ? 'bg-white text-secondary-700' : 'bg-soft text-primary'}`}>{lesson.lesson_order}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-extrabold text-primary">{lesson.title}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-muted">
                            {hasVideo && <><PlaySquare className="h-3 w-3 text-secondary" aria-hidden="true" />فيديو</>}
                            {hasPdf && <><FileText className="h-3 w-3 text-red-500" aria-hidden="true" />PDF</>}
                            {!hasVideo && !hasPdf && <span className="text-amber-600">لا يوجد محتوى</span>}
                            {resCount > 1 && <span className="text-muted">({resCount})</span>}
                          </span>
                        </span>
                      </button>
                    );
                  })
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
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-blue-700"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p>أضف المحتوى الذي تريد أن يظهر للطالب في هذا الدرس<br /><span className="font-semibold text-blue-600">يمكنك إضافة أكثر من فيديو وأكثر من ملف PDF لكل درس</span></p></div>

                    {resourceError && <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">{resourceError}</div>}

                    {/* Videos section */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlaySquare className="h-4 w-4 text-secondary" aria-hidden="true" />
                          <span className="text-xs font-extrabold text-primary">الفيديوهات</span>
                          {videoDrafts.length > 0 && <span className="text-[10px] font-bold text-muted">{videoDrafts.length}</span>}
                        </div>
                        <button type="button" onClick={() => addDraftRow('video')} className="inline-flex items-center gap-1 rounded-lg bg-secondary-50 px-2.5 py-1.5 text-[11px] font-extrabold text-secondary transition hover:bg-secondary-100"><Plus className="h-3.5 w-3.5" />فيديو</button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {videoDrafts.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-secondary-200 px-4 py-3 text-center text-[11px] font-bold text-muted">لا توجد فيديوهات. اضغط «فيديو» للإضافة.</p>
                        ) : videoDrafts.map((draft, resourceIndex) => {
                          const index = drafts.indexOf(draft);
                          return (
                            <div key={index}>
                              <ResourceRow
                                draft={draft}
                                resourceNumber={resourceIndex + 1}
                                icon={<PlaySquare className="h-4 w-4 text-secondary" aria-hidden="true" />}
                                iconClass="bg-secondary-50"
                                onTitleChange={(val) => updateDraft(index, { title: val })}
                                onUrlChange={(val) => updateDraft(index, { url: val })}
                                onSave={() => saveDraft(index)}
                                onDelete={() => deleteDraft(index)}
                                onPreview={() => setPreviewIndex(previewIndex === index ? null : index)}
                                isPreviewOpen={previewIndex === index}
                                canPreview={!!draft.url.trim() && !draft.dirty}
                              />
                              {previewIndex === index && draft.url.trim() && (
                                <VideoPlayer
                                  videoUrl={draft.url.trim()}
                                  title={draft.title}
                                  onClose={() => setPreviewIndex(null)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PDFs section */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-500" aria-hidden="true" />
                          <span className="text-xs font-extrabold text-primary">المذكرات (PDF)</span>
                          {pdfDrafts.length > 0 && <span className="text-[10px] font-bold text-muted">{pdfDrafts.length}</span>}
                        </div>
                        <button type="button" onClick={() => addDraftRow('pdf')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-100"><Plus className="h-3.5 w-3.5" />PDF</button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {pdfDrafts.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-red-200 px-4 py-3 text-center text-[11px] font-bold text-muted">لا توجد مذكرات. اضغط «PDF» للإضافة.</p>
                        ) : pdfDrafts.map((draft, resourceIndex) => {
                          const index = drafts.indexOf(draft);
                          return (
                            <div key={index}>
                              <ResourceRow
                                draft={draft}
                                resourceNumber={resourceIndex + 1}
                                icon={<FileText className="h-4 w-4 text-red-500" aria-hidden="true" />}
                                iconClass="bg-red-50"
                                onTitleChange={(val) => updateDraft(index, { title: val })}
                                onUrlChange={(val) => updateDraft(index, { url: val })}
                                onSave={() => saveDraft(index)}
                                onDelete={() => deleteDraft(index)}
                                onPreview={() => setPreviewIndex(previewIndex === index ? null : index)}
                                isPreviewOpen={previewIndex === index}
                                canPreview={!!draft.url.trim() && !draft.dirty}
                              />
                              {previewIndex === index && draft.url.trim() && (
                                <PdfViewer
                                  pdfUrl={draft.url.trim()}
                                  title={draft.title}
                                  onClose={() => setPreviewIndex(null)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Placeholder action rows (quiz + homework — not implemented) */}
                    <div className="mt-5 flex flex-col gap-3">
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

                    <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-amber-800"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" /><p><span className="font-extrabold">ملاحظة</span><br /><span className="font-semibold">كل فيديو أو ملف يتم حفظه على حدة. سيظهر للطالب فقط ما تم حفظه.</span></p></div>
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

function ResourceRow({
  draft,
  resourceNumber,
  icon,
  iconClass,
  onTitleChange,
  onUrlChange,
  onSave,
  onDelete,
  onPreview,
  isPreviewOpen,
  canPreview,
}: {
  draft: ResourceDraft;
  resourceNumber: number;
  icon: React.ReactNode;
  iconClass: string;
  onTitleChange: (val: string) => void;
  onUrlChange: (val: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onPreview: () => void;
  isPreviewOpen: boolean;
  canPreview: boolean;
}) {
  return (
    <div className="rounded-xl border border-secondary-100 p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-black text-primary">{resourceNumber}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{icon}</span>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="العنوان"
          className={`${INPUT_CLASS} text-xs`}
        />
        <button
          type="button"
          onClick={onPreview}
          disabled={!canPreview}
          className={`shrink-0 rounded-lg p-2 transition disabled:opacity-40 ${isPreviewOpen ? 'bg-secondary-50 text-secondary' : 'text-secondary-400 hover:bg-secondary-50 hover:text-secondary'}`}
          aria-label="معاينة"
          title="معاينة"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={draft.saving}
          className="shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          aria-label="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="url"
          dir="ltr"
          value={draft.url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
          className={`${INPUT_CLASS} text-left text-xs`}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={draft.saving || !draft.dirty}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-secondary-700 disabled:opacity-50"
        >
          {draft.saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          حفظ
        </button>
      </div>
    </div>
  );
}
