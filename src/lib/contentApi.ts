import { supabase } from './supabaseClient';

export interface ContentGrade {
  id: string;
  title: string;
  slug: string;
  grade_order: number;
  created_at: string;
}

export interface ContentUnit {
  id: string;
  title: string;
  unit_order: number;
  grade_id: string | null;
  created_at: string;
}

export type ResourceType = 'video' | 'pdf';

export interface LessonResource {
  id: string;
  lesson_id: string;
  resource_type: ResourceType;
  title: string;
  url: string;
  resource_order: number;
  created_at: string;
}

export interface LessonHomework {
  id: string;
  lesson_id: string;
  title: string;
  instructions: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentLesson {
  id: string;
  unit_id: string;
  title: string;
  lesson_order: number;
  video_url: string | null;
  pdf_url: string | null;
  created_at: string;
  lesson_resources?: LessonResource[];
  lesson_homework?: LessonHomework | null;
}

export interface LessonWithCount extends ContentUnit {
  lesson_count: number;
}

/* ---- Grades CRUD ---- */

export async function fetchGrades(): Promise<ContentGrade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('id, title, slug, grade_order, created_at')
    .order('grade_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createGrade(title: string, slug: string, gradeOrder: number): Promise<ContentGrade> {
  const { data, error } = await supabase
    .from('grades')
    .insert({ title, slug, grade_order: gradeOrder })
    .select('id, title, slug, grade_order, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function updateGrade(gradeId: string, fields: { title?: string; slug?: string; grade_order?: number }): Promise<ContentGrade> {
  const { data, error } = await supabase
    .from('grades')
    .update(fields)
    .eq('id', gradeId)
    .select('id, title, slug, grade_order, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGrade(gradeId: string): Promise<void> {
  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', gradeId);

  if (error) throw error;
}

/* ---- Units CRUD ---- */

export async function fetchUnitsWithLessonCount(gradeId?: string): Promise<LessonWithCount[]> {
  const response = gradeId
    ? await supabase
        .from('units')
        .select('id, title, unit_order, grade_id, created_at, lessons(id)')
        .eq('grade_id', gradeId)
        .order('unit_order', { ascending: true })
    : await supabase
        .from('units')
        .select('id, title, unit_order, grade_id, created_at, lessons(id)')
        .order('unit_order', { ascending: true });

  const { data, error } = response;

  if (error) throw error;
  return (data ?? []).map((u: { id: string; title: string; unit_order: number; grade_id: string | null; created_at: string; lessons?: { id: string }[] }) => ({
    id: u.id,
    title: u.title,
    unit_order: u.unit_order,
    grade_id: u.grade_id,
    created_at: u.created_at,
    lesson_count: u.lessons?.length ?? 0,
  }));
}

export async function fetchLessonsByUnit(unitId: string): Promise<ContentLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at, lesson_resources(id, lesson_id, resource_type, title, url, resource_order, created_at), lesson_homework(id, lesson_id, title, instructions, due_date, created_at, updated_at)')
    .eq('unit_id', unitId)
    .order('lesson_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((lesson) => ({
    ...lesson,
    lesson_resources: (lesson.lesson_resources ?? []).sort(
      (a: LessonResource, b: LessonResource) => a.resource_order - b.resource_order,
    ),
  }));
}

export async function createUnit(title: string, unitOrder: number, gradeId: string): Promise<ContentUnit> {
  const { data, error } = await supabase
    .from('units')
    .insert({ title, unit_order: unitOrder, grade_id: gradeId })
    .select('id, title, unit_order, grade_id, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function updateUnit(unitId: string, fields: { title?: string; unit_order?: number; grade_id?: string }): Promise<ContentUnit> {
  const { data, error } = await supabase
    .from('units')
    .update(fields)
    .eq('id', unitId)
    .select('id, title, unit_order, grade_id, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUnit(unitId: string): Promise<void> {
  const { error } = await supabase
    .from('units')
    .delete()
    .eq('id', unitId);

  if (error) throw error;
}

/* ---- Lessons CRUD ---- */

export async function createLesson(
  unitId: string,
  title: string,
  lessonOrder: number,
): Promise<ContentLesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ unit_id: unitId, title, lesson_order: lessonOrder })
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function updateLesson(lessonId: string, fields: { title?: string; lesson_order?: number }): Promise<ContentLesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update(fields)
    .eq('id', lessonId)
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) throw error;
}

export interface UnitWithLessons extends ContentUnit {
  lessons: ContentLesson[];
}

export async function fetchUnitsWithLessons(gradeId?: string): Promise<UnitWithLessons[]> {
  const response = gradeId
    ? await supabase
        .from('units')
        .select('id, title, unit_order, grade_id, created_at, lessons(id, unit_id, title, lesson_order, video_url, pdf_url, created_at, lesson_resources(id, lesson_id, resource_type, title, url, resource_order, created_at), lesson_homework(id, lesson_id, title, instructions, due_date, created_at, updated_at)))')
        .eq('grade_id', gradeId)
        .order('unit_order', { ascending: true })
    : await supabase
        .from('units')
        .select('id, title, unit_order, grade_id, created_at, lessons(id, unit_id, title, lesson_order, video_url, pdf_url, created_at, lesson_resources(id, lesson_id, resource_type, title, url, resource_order, created_at), lesson_homework(id, lesson_id, title, instructions, due_date, created_at, updated_at)))')
        .order('unit_order', { ascending: true });

  const { data, error } = response;

  if (error) throw error;
  return (data ?? []).map((u: { id: string; title: string; unit_order: number; grade_id: string | null; created_at: string; lessons?: ContentLesson[] }) => ({
    id: u.id,
    title: u.title,
    unit_order: u.unit_order,
    grade_id: u.grade_id,
    created_at: u.created_at,
    lessons: (u.lessons ?? [])
      .sort((a: ContentLesson, b: ContentLesson) => a.lesson_order - b.lesson_order)
      .map((lesson: ContentLesson) => ({
        ...lesson,
        lesson_resources: (lesson.lesson_resources ?? []).sort(
          (a: LessonResource, b: LessonResource) => a.resource_order - b.resource_order,
        ),
      })),
  }));
}

/* ---- Lesson Resources CRUD ---- */

export async function addLessonResource(
  lessonId: string,
  resourceType: ResourceType,
  title: string,
  url: string,
  resourceOrder: number,
): Promise<LessonResource> {
  const { data, error } = await supabase
    .from('lesson_resources')
    .insert({
      lesson_id: lessonId,
      resource_type: resourceType,
      title,
      url,
      resource_order: resourceOrder,
    })
    .select('id, lesson_id, resource_type, title, url, resource_order, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function updateLessonResource(
  resourceId: string,
  fields: { title?: string; url?: string; resource_order?: number },
): Promise<LessonResource> {
  const { data, error } = await supabase
    .from('lesson_resources')
    .update(fields)
    .eq('id', resourceId)
    .select('id, lesson_id, resource_type, title, url, resource_order, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLessonResource(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from('lesson_resources')
    .delete()
    .eq('id', resourceId);

  if (error) throw error;
}

/* ---- Lesson Homework CRUD ---- */

export async function fetchLessonHomework(lessonId: string): Promise<LessonHomework | null> {
  const { data, error } = await supabase
    .from('lesson_homework')
    .select('id, lesson_id, title, instructions, due_date, created_at, updated_at')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveLessonHomework(
  lessonId: string,
  title: string,
  instructions: string,
  dueDate: string | null,
): Promise<LessonHomework> {
  const { data: existing } = await supabase
    .from('lesson_homework')
    .select('id')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('lesson_homework')
      .update({ title, instructions, due_date: dueDate, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('id, lesson_id, title, instructions, due_date, created_at, updated_at')
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('lesson_homework')
    .insert({ lesson_id: lessonId, title, instructions, due_date: dueDate })
    .select('id, lesson_id, title, instructions, due_date, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLessonHomework(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('lesson_homework')
    .delete()
    .eq('lesson_id', lessonId);
  if (error) throw error;
}
