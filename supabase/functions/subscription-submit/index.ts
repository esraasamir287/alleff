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
const PHONE_RE = /^01[0125][0-9]{8}$/;

type ClassDay = 'thursday' | 'sunday';
type StudySystem = 'arabic' | 'languages';

interface SubscriptionBody {
  fullName?: string;
  email?: string;
  phone?: string;
  studySystem?: StudySystem;
  wantsOnline?: boolean;
  classDay?: ClassDay;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  studySystem?: string;
  classDay?: string;
}

function errorResponse(
  status: number,
  message: string,
  fieldErrors: FieldErrors = {},
): Response {
  return new Response(
    JSON.stringify({ success: false, message, errors: fieldErrors }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

function successResponse(message: string): Response {
  return new Response(
    JSON.stringify({ success: true, message }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

function normalizePhone(raw: string): string {
  let digits = (raw || '').replace(/[\s-]/g, '');
  if (digits.startsWith('+2')) digits = digits.slice(2);
  else if (digits.startsWith('20') && digits.length === 12) digits = '0' + digits.slice(2);
  return digits;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse(405, 'الطريقة غير مسموح بها.');
  }

  let body: SubscriptionBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'بيانات غير صحيحة.');
  }

  const fieldErrors: FieldErrors = {};

  const fullName = (body.fullName || '').trim();
  if (!fullName) fieldErrors.fullName = 'يرجى إدخال الاسم الكامل.';

  const email = (body.email || '').trim().toLowerCase();
  if (!email) {
    fieldErrors.email = 'يرجى إدخال البريد الإلكتروني.';
  } else if (!EMAIL_RE.test(email)) {
    fieldErrors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }

  const normalizedPhone = normalizePhone((body.phone || '').trim());
  if (!normalizedPhone) {
    fieldErrors.phone = 'يرجى إدخال رقم الهاتف.';
  } else if (!PHONE_RE.test(normalizedPhone)) {
    fieldErrors.phone = 'يرجى إدخال رقم هاتف مصري صحيح.';
  }

  const studySystem = body.studySystem;
  if (studySystem && studySystem !== 'arabic' && studySystem !== 'languages') {
    fieldErrors.studySystem = 'نظام الدراسة غير صحيح.';
  }

  const wantsOnline = !!body.wantsOnline;
  const classDay = body.classDay;

  if (wantsOnline) {
    if (!classDay || (classDay !== 'thursday' && classDay !== 'sunday')) {
      fieldErrors.classDay = 'يرجى اختيار يوم الحصة المباشرة.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(422, 'يرجى تصحيح الأخطاء في النموذج.', fieldErrors);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

  // Use the service-role client for the write so it works regardless of
  // whether the caller is anonymous or authenticated. RLS on the table
  // already permits anon inserts, but the service role guarantees the
  // upsert succeeds for both paths.
  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const status = wantsOnline ? 'subscribed' : 'not_subscribed';
  const payload = {
    full_name: fullName,
    email,
    phone: normalizedPhone,
    study_system: studySystem ?? null,
    wants_online: wantsOnline,
    class_day: wantsOnline ? (classDay as ClassDay) : null,
    subscription_status: status,
    submission_origin: 'public' as const,
    updated_at: new Date().toISOString(),
  };

  // Try to link the submission to an existing account by email so logged-in
  // users who use the public form still get their user_id attached.
  let linkedUserId: string | null = null;
  if (email) {
    const { data: profile } = await adminClient
      .from('student_profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();
    if (profile?.user_id) linkedUserId = profile.user_id as string;
  }

  const upsertPayload = {
    ...payload,
    user_id: linkedUserId,
    submission_origin: linkedUserId ? 'account' as const : 'public' as const,
  };

  const { error } = await adminClient
    .from('subscriptions')
    .upsert(upsertPayload, { onConflict: 'email' })
    .select('id')
    .maybeSingle();

  if (error) {
    return errorResponse(500, 'تعذر حفظ اختيارك حاليًا. يرجى المحاولة مرة أخرى.');
  }

  return successResponse(
    wantsOnline
      ? 'تم تسجيل اشتراكك بنجاح! سنتواصل معك قريبًا.'
      : 'تم حفظ اختيارك بنجاح. شكرًا لك!',
  );
});
