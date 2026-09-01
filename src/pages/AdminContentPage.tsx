import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookOpen, ClipboardCheck, CreditCard as Edit3, Eye, FileText, GraduationCap, Info, Layers, Lightbulb, Loader2, PlaySquare, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { PdfViewer } from '../components/ui/PdfViewer';
import {
  fetchGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  fetchUnitsWithLessonCount,
  fetchLessonsByUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  createLesson,
  updateLesson,
  deleteLesson,
  addLessonResource,
  updateLessonResource,
  deleteLessonResource,
  fetchLessonHomework,
  saveLessonHomework,
  deleteLessonHomework,
  type ContentGrade,
  type ContentLesson,
  type LessonHomework,
  type LessonResource,
  type LessonWithCount,
  type ResourceType,
  type UnitWithLessons,
} from '../lib/contentApi';

type ModalState = 'closed' | 'addGrade' | 'editGrade' | 'addUnit' | 'editUnit' | 'addLesson' | 'editLesson';

const INPUT_CLASS = 'w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 px-3 text-sm font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary';

/* ----------------------------- Main Page ----------------------------- */

export function AdminContentPage() {
  const [grades, setGrades] = useState<ContentGrade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>('closed');

  // Form state for grade/unit/lesson modals
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formOrder, setFormOrder] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lessonModalUnitId, setLessonModalUnitId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'grade' | 'unit' | 'lesson'; id: string; title: string } | null>(null);

  function bumpRefresh() {
    setRefreshKey((k) => k + 1);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'grade') {
        await deleteGrade(deleteTarget.id);
        await loadGrades();
      } else if (deleteTarget.type === 'unit') {
        await deleteUnit(deleteTarget.id);
      } else if (deleteTarget.type === 'lesson') {
        await deleteLesson(deleteTarget.id);
      }
      bumpRefresh();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  }

  const loadGrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrades();
      setGrades(data);
      if (data.length > 0 && !selectedGradeId) {
        setSelectedGradeId(data[0].id);
      } else if (data.length === 0) {
        setSelectedGradeId(null);
      }
    } catch {
      setError('تعذّر تحميل الصفوف الدراسية. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [selectedGradeId]);

  useEffect(() => {
    void loadGrades();
  }, [loadGrades]);

  const selectedGrade = grades.find((g) => g.id === selectedGradeId) ?? null;

  function closeModal() {
    setModal('closed');
    setFormError(null);
    setEditingId(null);
    setLessonModalUnitId(null);
  }

  function openAddGrade() {
    setFormTitle('');
    setFormSlug('');
    setFormOrder(String(grades.length + 1));
    setFormError(null);
    setModal('addGrade');
  }

  function openEditGrade(grade: ContentGrade) {
    setFormTitle(grade.title);
    setFormSlug(grade.slug);
    setFormOrder(String(grade.grade_order));
    setEditingId(grade.id);
    setFormError(null);
    setModal('editGrade');
  }

  function openAddUnit() {
    if (!selectedGradeId) return;
    setFormTitle('');
    setFormOrder('1');
    setFormError(null);
    setModal('addUnit');
  }

  function openEditUnit(unit: LessonWithCount) {
    setFormTitle(unit.title);
    setFormOrder(String(unit.unit_order));
    setEditingId(unit.id);
    setFormError(null);
    setModal('editUnit');
  }

  function openAddLesson(unitId: string) {
    setLessonModalUnitId(unitId);
    setFormTitle('');
    setFormOrder('1');
    setFormError(null);
    setModal('addLesson');
  }

  function openEditLesson(lesson: ContentLesson) {
    setLessonModalUnitId(lesson.unit_id);
    setFormTitle(lesson.title);
    setFormOrder(String(lesson.lesson_order));
    setEditingId(lesson.id);
    setFormError(null);
    setModal('editLesson');
  }

  async function handleSaveGrade() {
    setFormError(null);
    if (!formTitle.trim()) { setFormError('يرجى إدخال اسم الصف'); return; }
    if (!formSlug.trim()) { setFormError('يرجى إدخال المعرّف (slug)'); return; }
    const order = parseInt(formOrder, 10);
    if (isNaN(order) || order < 1) { setFormError('الترتيب يجب أن يكون رقمًا صحيحًا'); return; }

    setSaving(true);
    try {
      if (modal === 'editGrade' && editingId) {
        await updateGrade(editingId, { title: formTitle.trim(), slug: formSlug.trim(), grade_order: order });
      } else {
        await createGrade(formTitle.trim(), formSlug.trim(), order);
      }
      closeModal();
      await loadGrades();
      bumpRefresh();
    } catch {
      setFormError('تعذّر حفظ الصف. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveUnit() {
    if (!selectedGradeId) return;
    setFormError(null);
    if (!formTitle.trim()) { setFormError('يرجى إدخال عنوان الوحدة'); return; }
    const order = parseInt(formOrder, 10);
    if (isNaN(order) || order < 1) { setFormError('ترتيب الوحدة يجب أن يكون رقمًا صحيحًا'); return; }

    setSaving(true);
    try {
      if (modal === 'editUnit' && editingId) {
        await updateUnit(editingId, { title: formTitle.trim(), unit_order: order });
      } else {
        await createUnit(formTitle.trim(), order, selectedGradeId);
      }
      closeModal();
      bumpRefresh();
    } catch {
      setFormError('تعذّر حفظ الوحدة. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLesson(unitId: string) {
    setFormError(null);
    if (!formTitle.trim()) { setFormError('يرجى إدخال عنوان الدرس'); return; }
    const order = parseInt(formOrder, 10);
    if (isNaN(order) || order < 1) { setFormError('ترتيب الدرس يجب أن يكون رقمًا صحيحًا'); return; }

    setSaving(true);
    try {
      if (modal === 'editLesson' && editingId) {
        await updateLesson(editingId, { title: formTitle.trim(), lesson_order: order });
      } else {
        await createLesson(unitId, formTitle.trim(), order);
      }
      closeModal();
      bumpRefresh();
    } catch {
      setFormError('تعذّر حفظ الدرس. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="المحتوى التعليمي" subtitle="إدارة الصفوف والوحدات والدروس والمحتوى" wide>
      <div className="flex flex-col gap-5">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button type="button" onClick={() => { setError(null); void loadGrades(); }} className="mt-1 text-xs font-bold text-red-600 underline hover:text-red-800">إعادة المحاولة</button>
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
            {grades.length} صف دراسي
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" aria-hidden="true" />
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-secondary-200 bg-white px-6 py-16 text-center">
            <GraduationCap className="h-12 w-12 text-secondary-200" aria-hidden="true" />
            <p className="text-base font-bold text-ink">لا توجد صفوف دراسية بعد</p>
            <p className="text-sm text-muted">ابدأ بإضافة صف دراسي لتنظيم المحتوى.</p>
            <button type="button" onClick={openAddGrade} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700">
              <Plus className="h-4 w-4" /> إضافة صف دراسي
            </button>
          </div>
        ) : (
          <div className="grid min-h-[680px] grid-cols-1 gap-4 lg:grid-cols-[230px_280px_minmax(0,1fr)]" dir="rtl">
            {/* Grades column */}
            <section className="order-1 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-3">
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="text-base font-extrabold text-primary">الصفوف</h3>
                <button type="button" onClick={openAddGrade} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700">
                  <Plus className="h-4 w-4" /> صف
                </button>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-2 rounded-xl bg-secondary-50/70 px-3 py-2.5 text-[10px] font-bold leading-relaxed text-secondary-700">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                  اختر الصف لإدارة وحداته
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {grades.map((grade) => (
                  <div key={grade.id} className={`group flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedGradeId === grade.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
                    <button type="button" onClick={() => setSelectedGradeId(grade.id)} className="flex min-w-0 flex-1 items-center gap-3 text-right">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${selectedGradeId === grade.id ? 'bg-white text-secondary-700' : 'bg-soft text-primary'}`}>
                        {grade.grade_order}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-primary">{grade.title}</span>
                        <span className="mt-1 block truncate text-[10px] font-bold text-muted">{grade.slug}</span>
                      </span>
                    </button>
                    <button type="button" onClick={() => openEditGrade(grade)} className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-soft hover:text-secondary group-hover:opacity-100" aria-label="تعديل">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget({ type: 'grade', id: grade.id, title: grade.title })} className="shrink-0 rounded-lg p-1.5 text-red-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label="حذف">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Units + Lessons column */}
            <section className="order-2 rounded-2xl border border-secondary-100 bg-white p-3 shadow-soft lg:order-2">
              {selectedGrade ? (
                <UnitsColumn
                  gradeId={selectedGrade.id}
                  gradeTitle={selectedGrade.title}
                  refreshKey={refreshKey}
                  onAddUnit={openAddUnit}
                  onEditUnit={openEditUnit}
                  onDeleteUnit={(unit) => setDeleteTarget({ type: 'unit', id: unit.id, title: unit.title })}
                  onAddLesson={openAddLesson}
                  onEditLesson={openEditLesson}
                  onDeleteLesson={(lesson) => setDeleteTarget({ type: 'lesson', id: lesson.id, title: lesson.title })}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                  <Layers className="h-10 w-10 text-secondary-200" aria-hidden="true" />
                  <p className="text-sm font-bold text-ink">اختر صفًا دراسيًا أولًا</p>
                </div>
              )}
            </section>

            {/* Lesson content column */}
            <section className="order-3 overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-soft lg:order-1">
              {selectedGrade ? (
                <LessonContentColumn gradeId={selectedGrade.id} gradeTitle={selectedGrade.title} refreshKey={refreshKey} onAddLesson={openAddLesson} onEditLesson={openEditLesson} onDeleteLesson={(lesson) => setDeleteTarget({ type: 'lesson', id: lesson.id, title: lesson.title })} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                  <BookOpen className="h-12 w-12 text-secondary-200" aria-hidden="true" />
                  <p className="text-base font-bold text-ink">اختر صفًا دراسيًا للبدء</p>
                  <p className="text-sm text-muted">ستظهر هنا الوحدات والدروس والمحتوى.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      <Modal open={modal === 'addGrade' || modal === 'editGrade'} onClose={closeModal} title={modal === 'editGrade' ? 'تعديل الصف الدراسي' : 'إضافة صف دراسي جديد'}>
        <div className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">اسم الصف</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="مثال: الصف الأول الثانوي" className={INPUT_CLASS} autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">المعرّف (slug)</label>
            <input type="text" dir="ltr" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="first-secondary" className={`${INPUT_CLASS} text-left`} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">ترتيب الصف</label>
            <input type="number" min={1} value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
            <button type="button" onClick={handleSaveGrade} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </button>
          </div>
        </div>
      </Modal>

      {/* Unit Modal */}
      <Modal open={modal === 'addUnit' || modal === 'editUnit'} onClose={closeModal} title={modal === 'editUnit' ? 'تعديل الوحدة' : `إضافة وحدة جديدة${selectedGrade ? ` — ${selectedGrade.title}` : ''}`}>
        <div className="flex flex-col gap-4">
          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">عنوان الوحدة</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="مثال: الوحدة الأولى" className={INPUT_CLASS} autoFocus />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-muted">ترتيب الوحدة</label>
            <input type="number" min={1} value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={closeModal} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
            <button type="button" onClick={handleSaveUnit} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </button>
          </div>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <LessonModal
        modal={modal}
        onClose={closeModal}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formOrder={formOrder}
        setFormOrder={setFormOrder}
        formError={formError}
        saving={saving}
        onSave={handleSaveLesson}
        selectedUnitId={lessonModalUnitId}
      />
      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="تأكيد الحذف">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm font-bold text-red-700">هل أنت متأكد من حذف «{deleteTarget?.title}»؟{deleteTarget?.type === 'grade' && ' سيتم حذف جميع الوحدات والدروس بداخله.'}{deleteTarget?.type === 'unit' && ' سيتم حذف جميع الدروس بداخله.'}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
            <button type="button" onClick={handleConfirmDelete} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700"><Trash2 className="h-4 w-4" />حذف نهائي</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

/* ----------------------------- Units Column ----------------------------- */

function UnitsColumn({ gradeId, gradeTitle, refreshKey, onAddUnit, onEditUnit, onDeleteUnit, onAddLesson, onEditLesson, onDeleteLesson }: {
  gradeId: string;
  gradeTitle: string;
  refreshKey: number;
  onAddUnit: () => void;
  onEditUnit: (unit: LessonWithCount) => void;
  onDeleteUnit: (unit: LessonWithCount) => void;
  onAddLesson: (unitId: string) => void;
  onEditLesson: (lesson: ContentLesson) => void;
  onDeleteLesson: (lesson: ContentLesson) => void;
}) {
  const [units, setUnits] = useState<LessonWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<ContentLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUnitsWithLessonCount(gradeId);
      setUnits(data);
      if (data.length > 0) {
        setSelectedUnitId((prev) => prev && data.some((u) => u.id === prev) ? prev : data[0].id);
      } else {
        setSelectedUnitId(null);
      }
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [gradeId]);

  const loadLessons = useCallback(async () => {
    if (!selectedUnitId) {
      setLessons([]);
      return;
    }
    setLessonsLoading(true);
    try {
      const data = await fetchLessonsByUnit(selectedUnitId);
      setLessons(data);
    } catch {
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [selectedUnitId]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits, refreshKey]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons, refreshKey]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) ?? null;

  const filteredUnits = search.trim()
    ? units.filter((u) => u.title.includes(search.trim()))
    : units;

  return (
    <>
      <div className="flex items-center justify-between px-2 py-2">
        <div>
          <h3 className="text-base font-extrabold text-primary">{gradeTitle}</h3>
          <p className="mt-1 text-[11px] font-bold text-muted">{units.length} وحدة</p>
        </div>
        <button type="button" onClick={onAddUnit} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3.5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700">
          <Plus className="h-4 w-4" /> وحدة
        </button>
      </div>
      <div className="relative mt-2">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن وحدة..." className="w-full rounded-xl border border-secondary-100 bg-soft/40 py-2.5 pr-9 pl-3 text-xs font-bold text-ink outline-none transition placeholder:text-muted focus:border-secondary" />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-secondary" aria-hidden="true" /></div>
        ) : filteredUnits.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs font-bold text-muted">لا توجد وحدات. اضغط «وحدة» للإضافة.</p>
        ) : (
          filteredUnits.map((unit) => (
            <div key={unit.id} className={`group flex items-center gap-3 rounded-xl border p-3 text-right transition ${selectedUnitId === unit.id ? 'border-secondary-200 bg-secondary-50' : 'border-secondary-100 bg-white hover:bg-soft/50'}`}>
              <button type="button" onClick={() => setSelectedUnitId(unit.id)} className="flex min-w-0 flex-1 items-center gap-3 text-right">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${selectedUnitId === unit.id ? 'bg-white text-secondary-700' : 'bg-soft text-primary'}`}>{unit.lesson_count}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold text-primary">{unit.title}</span>
                  <span className="mt-1 block truncate text-[10px] font-bold text-muted">الترتيب: {unit.unit_order}</span>
                </span>
              </button>
              <button type="button" onClick={() => onEditUnit(unit)} className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-soft hover:text-secondary group-hover:opacity-100" aria-label="تعديل">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onDeleteUnit(unit)} className="shrink-0 rounded-lg p-1.5 text-red-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label="حذف">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Lessons inside selected unit */}
      <div className="mt-4 border-t border-secondary-100 pt-3">
        <div className="flex items-center justify-between px-2 py-2">
          <div>
            <h4 className="text-sm font-extrabold text-primary">{selectedUnit ? `دروس ${selectedUnit.title}` : 'الدروس'}</h4>
            <p className="mt-1 text-[10px] font-bold text-muted">{selectedUnit ? `${lessons.length} درس` : 'اختر وحدة'}</p>
          </div>
          {selectedUnitId && (
            <button type="button" onClick={() => selectedUnitId && onAddLesson(selectedUnitId)} className="inline-flex items-center gap-1 rounded-lg bg-secondary-50 px-2.5 py-1.5 text-[11px] font-extrabold text-secondary transition hover:bg-secondary-100">
              <Plus className="h-3.5 w-3.5" /> درس
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {lessonsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-secondary" aria-hidden="true" /></div>
          ) : lessons.length === 0 ? (
            <p className="px-2 py-4 text-center text-[11px] font-bold text-muted">{selectedUnitId ? 'لا توجد دروس. اضغط «درس» للإضافة.' : 'اختر وحدة أولًا.'}</p>
          ) : (
            lessons.map((lesson) => {
              const resCount = lesson.lesson_resources?.length ?? 0;
              const hasVideo = (lesson.lesson_resources ?? []).some((r) => r.resource_type === 'video') || !!lesson.video_url;
              const hasPdf = (lesson.lesson_resources ?? []).some((r) => r.resource_type === 'pdf') || !!lesson.pdf_url;
              return (
                <div key={lesson.id} className={`group flex items-center gap-3 rounded-xl border p-3 text-right transition border-secondary-100 bg-white hover:bg-soft/50`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold bg-soft text-primary`}>{lesson.lesson_order}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-extrabold text-primary">{lesson.title}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-muted">
                      {hasVideo && <><PlaySquare className="h-3 w-3 text-secondary" />فيديو</>}
                      {hasPdf && <><FileText className="h-3 w-3 text-red-500" />PDF</>}
                      {!hasVideo && !hasPdf && <span className="text-amber-600">لا يوجد محتوى</span>}
                      {resCount > 1 && <span className="text-muted">({resCount})</span>}
                    </span>
                  </span>
                  <button type="button" onClick={() => onEditLesson(lesson)} className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition hover:bg-soft hover:text-secondary group-hover:opacity-100" aria-label="تعديل">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => onDeleteLesson(lesson)} className="shrink-0 rounded-lg p-1.5 text-red-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label="حذف">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

/* ----------------------------- Lesson Content Column ----------------------------- */

function LessonContentColumn({ gradeId, gradeTitle, refreshKey, onAddLesson, onEditLesson, onDeleteLesson }: {
  gradeId: string;
  gradeTitle: string;
  refreshKey: number;
  onAddLesson: (unitId: string) => void;
  onEditLesson: (lesson: ContentLesson) => void;
  onDeleteLesson: (lesson: ContentLesson) => void;
}) {
  const [units, setUnits] = useState<UnitWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUnitsWithLessonCount(gradeId);
      setUnits(data.map((u) => ({ ...u, lessons: [] })));
      if (data.length > 0) {
        setSelectedUnitId((prev) => prev && data.some((u) => u.id === prev) ? prev : data[0].id);
      } else {
        setSelectedUnitId(null);
        setSelectedLessonId(null);
      }
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [gradeId]);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits, refreshKey]);

  const selectedUnit = units.find((u) => u.id === selectedUnitId) ?? null;
  const [lessons, setLessons] = useState<ContentLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

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
        setSelectedLessonId((prev) => prev && data.some((l) => l.id === prev) ? prev : data[0].id);
      } else {
        setSelectedLessonId(null);
      }
    } catch {
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [selectedUnitId]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons, refreshKey]);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null;

  return (
    <>
      <div className="border-b border-secondary-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <span>{gradeTitle}</span>
              <span>‹</span>
              <span>{selectedUnit?.title ?? 'اختر وحدة'}</span>
              <span>‹</span>
              <span className="text-secondary">{selectedLesson ? `الدرس ${selectedLesson.lesson_order}` : 'اختر درس'}</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-primary">{selectedLesson?.title ?? 'محتوى الدرس'}</h3>
          </div>
          <BookOpen className="mt-8 h-8 w-8 text-secondary-200" aria-hidden="true" />
        </div>

        {/* Unit selector tabs */}
        {!loading && units.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnitId(unit.id)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition ${selectedUnitId === unit.id ? 'bg-secondary text-white' : 'bg-soft text-primary hover:bg-secondary-50'}`}
              >
                {unit.title}
              </button>
            ))}
          </div>
        )}

        {/* Lesson selector */}
        {!lessonsLoading && lessons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition ${selectedLessonId === lesson.id ? 'bg-secondary-50 text-secondary border border-secondary-200' : 'bg-white text-muted border border-secondary-100 hover:bg-soft'}`}
              >
                {lesson.title}
              </button>
            ))}
            <button type="button" onClick={() => selectedUnitId && onAddLesson(selectedUnitId)} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-secondary-300 px-3 py-1.5 text-[11px] font-extrabold text-secondary transition hover:bg-secondary-50">
              <Plus className="h-3 w-3" /> درس
            </button>
          </div>
        )}
      </div>

      {selectedLesson ? (
        <LessonResources lesson={selectedLesson} onReload={loadLessons} onEditLesson={onEditLesson} onDeleteLesson={onDeleteLesson} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <BookOpen className="h-12 w-12 text-secondary-200" aria-hidden="true" />
          <p className="text-base font-bold text-ink">{selectedUnitId ? 'اختر درسًا لعرض محتواه' : 'اختر وحدة ثم درسًا للبدء'}</p>
          <p className="text-sm text-muted">ستظهر هنا فيديوهات ومذكرات الدرس.</p>
        </div>
      )}
    </>
  );
}

/* ----------------------------- Lesson Resources Editor ----------------------------- */

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

function LessonResources({ lesson, onReload, onEditLesson, onDeleteLesson }: { lesson: ContentLesson; onReload: () => void; onEditLesson: (lesson: ContentLesson) => void; onDeleteLesson: (lesson: ContentLesson) => void }) {
  const [drafts, setDrafts] = useState<ResourceDraft[]>([]);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    setDrafts(toDrafts(lesson.lesson_resources ?? []));
    setResourceError(null);
    setPreviewIndex(null);
  }, [lesson.id, lesson.lesson_resources]);

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
    const draft = drafts[index];
    if (!draft) return;
    if (!draft.url.trim()) { setResourceError('يرجى إدخال رابط صحيح'); return; }
    if (!draft.title.trim()) { setResourceError('يرجى إدخال عنوان للمحتوى'); return; }

    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: true } : d)));
    setResourceError(null);

    try {
      if (draft.isNew || !draft.id) {
        await addLessonResource(lesson.id, draft.resource_type, draft.title.trim(), draft.url.trim(), draft.resource_order);
        setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, isNew: false, dirty: false, saving: false } : d)));
      } else {
        await updateLessonResource(draft.id, { title: draft.title.trim(), url: draft.url.trim() });
        setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, dirty: false, saving: false } : d)));
      }
      await onReload();
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
      await onReload();
    } catch {
      setResourceError('تعذّر حذف المحتوى. حاول مرة أخرى.');
      setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, saving: false } : d)));
    }
  }

  const videoDrafts = drafts.filter((d) => d.resource_type === 'video');
  const pdfDrafts = drafts.filter((d) => d.resource_type === 'pdf');

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          <span>الدرس {lesson.lesson_order}: {lesson.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEditLesson(lesson)} className="inline-flex items-center gap-1 rounded-lg bg-soft px-3 py-1.5 text-[11px] font-extrabold text-primary transition hover:bg-secondary-50">
            <Edit3 className="h-3.5 w-3.5" /> تعديل الدرس
          </button>
          <button type="button" onClick={() => onDeleteLesson(lesson)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-100">
            <Trash2 className="h-3.5 w-3.5" /> حذف الدرس
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>أضف المحتوى الذي تريد أن يظهر للطالب في هذا الدرس<br /><span className="font-semibold text-blue-600">يمكنك إضافة عدد غير محدود من الفيديوهات وملفات PDF</span></p>
      </div>

      {resourceError && <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">{resourceError}</div>}

      {/* Videos section */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlaySquare className="h-4 w-4 text-secondary" aria-hidden="true" />
            <span className="text-xs font-extrabold text-primary">الفيديوهات</span>
            {videoDrafts.length > 0 && <span className="text-[10px] font-bold text-muted">{videoDrafts.length}</span>}
          </div>
          <button type="button" onClick={() => addDraftRow('video')} className="inline-flex items-center gap-1 rounded-lg bg-secondary-50 px-2.5 py-1.5 text-[11px] font-extrabold text-secondary transition hover:bg-secondary-100">
            <Plus className="h-3.5 w-3.5" />فيديو
          </button>
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
                  <VideoPlayer videoUrl={draft.url.trim()} title={draft.title} onClose={() => setPreviewIndex(null)} />
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
          <button type="button" onClick={() => addDraftRow('pdf')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-100">
            <Plus className="h-3.5 w-3.5" />PDF
          </button>
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
                  <PdfViewer pdfUrl={draft.url.trim()} title={draft.title} onClose={() => setPreviewIndex(null)} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Homework section */}
      <HomeworkEditor lesson={lesson} onReload={onReload} />

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3.5 text-xs font-bold leading-relaxed text-amber-800">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <p><span className="font-extrabold">ملاحظة</span><br /><span className="font-semibold">كل فيديو أو ملف يتم حفظه على حدة. سيظهر للطالب فقط ما تم حفظه.</span></p>
      </div>
    </div>
  );
}

/* ----------------------------- Homework Editor ----------------------------- */

function HomeworkEditor({ lesson, onReload }: { lesson: ContentLesson; onReload: () => void }) {
  const [hwTitle, setHwTitle] = useState('');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwExists, setHwExists] = useState(false);
  const [hwDirty, setHwDirty] = useState(false);
  const [hwSaving, setHwSaving] = useState(false);
  const [hwError, setHwError] = useState<string | null>(null);
  const [hwLoaded, setHwLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHwLoaded(false);
    setHwError(null);
    void (async () => {
      try {
        const hw = await fetchLessonHomework(lesson.id);
        if (cancelled) return;
        if (hw) {
          setHwTitle(hw.title);
          setHwInstructions(hw.instructions || '');
          setHwDueDate(hw.due_date ?? '');
          setHwExists(true);
        } else {
          setHwTitle('');
          setHwInstructions('');
          setHwDueDate('');
          setHwExists(false);
        }
        setHwDirty(false);
        setHwLoaded(true);
      } catch {
        if (!cancelled) {
          setHwError('تعذّر تحميل الواجب.');
          setHwLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [lesson.id]);

  function markDirty() { setHwDirty(true); }

  async function handleSaveHomework() {
    if (!hwTitle.trim()) { setHwError('يرجى إدخال عنوان الواجب'); return; }
    setHwSaving(true);
    setHwError(null);
    try {
      await saveLessonHomework(lesson.id, hwTitle.trim(), hwInstructions.trim(), hwDueDate || null);
      setHwExists(true);
      setHwDirty(false);
      await onReload();
    } catch {
      setHwError('تعذّر حفظ الواجب. حاول مرة أخرى.');
    } finally {
      setHwSaving(false);
    }
  }

  async function handleDeleteHomework() {
    setHwSaving(true);
    setHwError(null);
    try {
      await deleteLessonHomework(lesson.id);
      setHwTitle('');
      setHwInstructions('');
      setHwDueDate('');
      setHwExists(false);
      setHwDirty(false);
      await onReload();
    } catch {
      setHwError('تعذّر حذف الواجب. حاول مرة أخرى.');
    } finally {
      setHwSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-secondary-100 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <span className="text-xs font-extrabold text-primary">الواجب</span>
          {hwExists && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">منشور</span>}
        </div>
        {hwExists && !hwDirty && (
          <button type="button" onClick={handleDeleteHomework} disabled={hwSaving} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-100 disabled:opacity-50">
            {hwSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            حذف
          </button>
        )}
      </div>

      {hwError && <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">{hwError}</div>}

      {!hwLoaded ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-secondary" aria-hidden="true" /></div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted">عنوان الواجب</label>
            <input type="text" value={hwTitle} onChange={(e) => { setHwTitle(e.target.value); markDirty(); }} placeholder="مثال: واجب الدرس الأول" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted">التعليمات</label>
            <textarea value={hwInstructions} onChange={(e) => { setHwInstructions(e.target.value); markDirty(); }} placeholder="اكتب تعليمات الواجب هنا..." rows={3} className={`${INPUT_CLASS} resize-none`} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted">تاريخ التسليم</label>
            <input type="date" value={hwDueDate} onChange={(e) => { setHwDueDate(e.target.value); markDirty(); }} className={INPUT_CLASS} />
          </div>
          {hwDirty && (
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => { setHwDirty(false); void onReload(); }} disabled={hwSaving} className="rounded-lg px-3 py-2 text-[11px] font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
              <button type="button" onClick={handleSaveHomework} disabled={hwSaving} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-[11px] font-extrabold text-white transition hover:bg-secondary-700 disabled:opacity-50">
                {hwSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                حفظ الواجب
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Lesson Modal (separate to know unitId) ----------------------------- */

function LessonModal({ modal, onClose, formTitle, setFormTitle, formOrder, setFormOrder, formError, saving, onSave, selectedUnitId }: {
  modal: ModalState;
  onClose: () => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formOrder: string;
  setFormOrder: (v: string) => void;
  formError: string | null;
  saving: boolean;
  onSave: (unitId: string) => void;
  selectedUnitId: string | null;
}) {
  const isOpen = modal === 'addLesson' || modal === 'editLesson';
  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={modal === 'editLesson' ? 'تعديل الدرس' : 'إضافة درس جديد'}>
      <div className="flex flex-col gap-4">
        {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{formError}</p>}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted">عنوان الدرس</label>
          <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="مثال: الدرس الأول" className={INPUT_CLASS} autoFocus />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted">ترتيب الدرس</label>
          <input type="number" min={1} value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className={INPUT_CLASS} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-muted transition hover:bg-soft">إلغاء</button>
          <button
            type="button"
            onClick={() => { if (selectedUnitId) onSave(selectedUnitId); }}
            disabled={saving || !selectedUnitId}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-secondary-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Shared UI ----------------------------- */

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft text-[11px] font-black text-primary">{resourceNumber}</span>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{icon}</span>
        </div>
        <div className="flex items-center gap-1.5">
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
      </div>
      <div className="mt-2">
        <label className="mb-1 block text-[11px] font-bold text-muted">العنوان</label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="العنوان"
          className={`${INPUT_CLASS} text-xs`}
        />
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
