import {
  createClient,
  SupabaseClient,
} from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginBody {
  identifier?: string;
  password?: string;
  rememberMe?: boolean;
}

interface FieldErrors {
  identifier?: string;
  password?: string;
}

function normalizePhone(raw: string): string {
  let digits = (raw || '').replace(/[\s-]/g, '');
  if (digits.startsWith('+2')) digits = digits.slice(2);
  else if (digits.startsWith('20') && digits.length === 12) digits = '0' + digits.slice(2);
  return digits;
}

function isEgyptianPhone(normalized: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalized);
}

function looksLikeEmail(v: string): boolean {
  return EMAIL_RE.test(v);
}

function errorResponse(status: number, message: string, fieldErrors: FieldErrors = {}): Response {
  return new Response(
    JSON.stringify({ success: false, message, errors: fieldErrors }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

function successResponse(message: string, user: unknown, session: unknown): Response {
  return new Response(
    JSON.stringify({ success: true, message, data: { user, session } }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse(405, 'الطريقة غير مسموح بها.');
  }

  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'بيانات غير صحيحة.');
  }

  const fieldErrors: FieldErrors = {};
  if (!body.identifier || !body.identifier.trim()) {
    fieldErrors.identifier = 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف.';
  }
  if (!body.password) {
    fieldErrors.password = 'يرجى إدخال كلمة المرور.';
  }
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(422, 'يرجى تصحيح الأخطاء في النموذج.', fieldErrors);
  }

  const trimmed = body.identifier!.trim();
  const isEmail = looksLikeEmail(trimmed);
  const normalizedPhone = normalizePhone(trimmed);

  if (!isEmail && !isEgyptianPhone(normalizedPhone)) {
    return errorResponse(422, 'يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف مصري صحيح.', {
      identifier: 'يرجى إدخال بريد إلكتروني صحيح أو رقم هاتف مصري صحيح.',
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let loginEmail = isEmail ? trimmed.toLowerCase() : '';

  // If the identifier is a phone number, resolve it to the user's email.
  if (!isEmail) {
    const { data, error } = await adminClient
      .from('student_profiles')
      .select('email')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (error || !data) {
      // Generic message — do not reveal whether the phone exists.
      return errorResponse(401, 'بيانات تسجيل الدخول غير صحيحة.');
    }
    loginEmail = data.email;
  }

  // Authenticate with the resolved email + password using a client that does
  // NOT persist a session (the frontend manages its own session via the anon
  // client). We return the tokens so the frontend can set them.
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
  const authClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sessionData, error: sessionError } = await authClient.auth.signInWithPassword({
    email: loginEmail,
    password: body.password!,
  });

  if (sessionError || !sessionData.session || !sessionData.user) {
    return errorResponse(401, 'بيانات تسجيل الدخول غير صحيحة.');
  }

  // Fetch the public profile fields to return to the frontend.
  const { data: profile } = await adminClient
    .from('student_profiles')
    .select('full_name, phone, email, academic_grade, governorate, study_system')
    .eq('user_id', sessionData.user.id)
    .maybeSingle();

  const publicUser = {
    id: sessionData.user.id,
    email: sessionData.user.email,
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    academicGrade: profile?.academic_grade ?? '',
    governorate: profile?.governorate ?? '',
    studySystem: (profile?.study_system as 'arabic' | 'languages' | null) ?? null,
  };

  return successResponse('تم تسجيل الدخول بنجاح.', publicUser, {
    accessToken: sessionData.session.access_token,
    refreshToken: sessionData.session.refresh_token,
    expiresIn: sessionData.session.expires_in,
    expiresAt: sessionData.session.expires_at,
    rememberMe: !!body.rememberMe,
  });
});
