import { supabase, setRememberMe } from './supabaseClient';

export type StudySystemValue = 'arabic' | 'languages';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SignupPayload {
  fullName: string;
  phone: string;
  email: string;
  academicGrade: string;
  governorate: string;
  studySystem: StudySystemValue;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  academicGrade: string;
  governorate: string;
  studySystem: StudySystemValue | null;
}

export interface FieldErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  academicGrade?: string;
  governorate?: string;
  studySystem?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  identifier?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  fieldErrors?: FieldErrors;
  user?: AuthUser;
}

export interface SessionResult extends AuthResult {
  data?: {
    user?: AuthUser;
    session?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expiresAt: number;
      rememberMe?: boolean;
    } | null;
  };
  needsSessionSet?: boolean;
  accessToken?: string;
  refreshToken?: string;
  rememberMe?: boolean;
}

function functionUrl(slug: string): string {
  return `${SUPABASE_URL}/functions/v1/${slug}`;
}

async function callEdgeFunction<T>(slug: string, payload: unknown): Promise<T> {
  const response = await fetch(functionUrl(slug), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    /* malformed body */
  }

  if (!response.ok) {
    const err = data as { message?: string; errors?: FieldErrors };
    return {
      success: false,
      message: err?.message ?? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
      fieldErrors: err?.errors,
    } as unknown as T;
  }

  return data as T;
}

export async function signUp(payload: SignupPayload): Promise<SessionResult> {
  const result = await callEdgeFunction<SessionResult>('auth-signup', payload);

  const sessionTokens = result.data?.session;
  if (result.success && sessionTokens?.accessToken && sessionTokens?.refreshToken) {
    setRememberMe(true);
    const { error } = await supabase.auth.setSession({
      access_token: sessionTokens.accessToken,
      refresh_token: sessionTokens.refreshToken,
    });
    if (error) {
      return {
        success: false,
        message: 'تم إنشاء حسابك ولكن حدث خطأ أثناء حفظ الجلسة. يرجى تسجيل الدخول.',
      };
    }
  }

  return result;
}

export async function login(payload: LoginPayload): Promise<SessionResult> {
  const result = await callEdgeFunction<SessionResult>('auth-login', payload);

  const sessionTokens = result.data?.session;
  if (result.success && sessionTokens?.accessToken && sessionTokens?.refreshToken) {
    setRememberMe(payload.rememberMe);
    const { error } = await supabase.auth.setSession({
      access_token: sessionTokens.accessToken,
      refresh_token: sessionTokens.refreshToken,
    });
    if (error) {
      return {
        success: false,
        message: 'تم التحقق من البيانات ولكن حدث خطأ أثناء حفظ الجلسة. يرجى المحاولة مرة أخرى.',
      };
    }
  }

  return result;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('full_name, phone, email, academic_grade, governorate, study_system')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    academicGrade: profile.academic_grade,
    governorate: profile.governorate,
    studySystem: (profile.study_system as StudySystemValue | null) ?? null,
  };
}
