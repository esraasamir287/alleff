import { supabase } from './supabaseClient';
import type { StudySystemValue } from './authApi';

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  academicGrade: string;
  governorate: string;
  studySystem: StudySystemValue | null;
}

export async function fetchStudentProfile(
  userId: string,
): Promise<StudentProfile | null> {
  const { data, error } = await supabase
    .from('student_profiles')
    .select(
      'id, user_id, full_name, phone, email, academic_grade, governorate, study_system',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    academicGrade: data.academic_grade,
    governorate: data.governorate,
    studySystem: (data.study_system as StudySystemValue | null) ?? null,
  };
}

export async function updateStudySystem(
  userId: string,
  studySystem: StudySystemValue,
): Promise<void> {
  const { error } = await supabase
    .from('student_profiles')
    .update({ study_system: studySystem, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
}
