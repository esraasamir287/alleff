import { supabase } from './supabaseClient';

export interface ContentUnit {
  id: string;
  title: string;
  unit_order: number;
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

export interface ContentLesson {
  id: string;
  unit_id: string;
  title: string;
  lesson_order: number;
  video_url: string | null;
  pdf_url: string | null;
  created_at: string;
  lesson_resources?: LessonResource[];
}

export interface LessonWithCount extends ContentUnit {
  lesson_count: number;
}

export async function fetchUnitsWithLessonCount(): Promise<LessonWithCount[]> {
  const { data, error } = await supabase
    .from('units')
    .select('id, title, unit_order, created_at, lessons(id)')
    .order('unit_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((u) => ({
    id: u.id,
    title: u.title,
    unit_order: u.unit_order,
    created_at: u.created_at,
    lesson_count: u.lessons?.length ?? 0,
  }));
}

export async function fetchLessonsByUnit(unitId: string): Promise<ContentLesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at, lesson_resources(id, lesson_id, resource_type, title, url, resource_order, created_at)')
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

export async function createUnit(title: string, unitOrder: number): Promise<ContentUnit> {
  const { data, error } = await supabase
    .from('units')
    .insert({ title, unit_order: unitOrder })
    .select('id, title, unit_order, created_at')
    .single();

  if (error) throw error;
  return data;
}

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

export interface UnitWithLessons extends ContentUnit {
  lessons: ContentLesson[];
}

export async function fetchUnitsWithLessons(): Promise<UnitWithLessons[]> {
  const { data, error } = await supabase
    .from('units')
    .select('id, title, unit_order, created_at, lessons(id, unit_id, title, lesson_order, video_url, pdf_url, created_at, lesson_resources(id, lesson_id, resource_type, title, url, resource_order, created_at))')
    .order('unit_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((u) => ({
    id: u.id,
    title: u.title,
    unit_order: u.unit_order,
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

export async function updateLessonContent(
  lessonId: string,
  fields: { video_url?: string | null; pdf_url?: string | null },
): Promise<ContentLesson> {
  const { data, error } = await supabase
    .from('lessons')
    .update(fields)
    .eq('id', lessonId)
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at')
    .single();

  if (error) throw error;
  return data;
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
