import { supabase } from './supabaseClient';

export interface ContentUnit {
  id: string;
  title: string;
  unit_order: number;
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
    .select('id, unit_id, title, lesson_order, video_url, pdf_url, created_at')
    .eq('unit_id', unitId)
    .order('lesson_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
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
