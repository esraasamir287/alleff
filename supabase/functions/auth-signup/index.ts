import {
  createClient,
  SupabaseClient,
} from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ALLOWED_GRADES = ['second'];
const ALLOWED_STUDY_SYSTEMS = ['arabic', 'languages'];
const ALLOWED_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
];

interface SignupBody {
  fullName?: string;
  phone?: string;
  email?: string;
  academicGrade?: string;
  governorate?: string;
  studySystem?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: boolean;
}

interface FieldErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  academicGrade?: string;
  governorate?: string;
  studySystem?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw: string): string {
  let digits = (raw || '').replace(/[\s-]/g, '');
  if (digits.startsWith('+2')) digits = digits.slice(2);
  else if (digits.startsWith('20') && digits.length === 12) digits = '0' + digits.slice(2);
  return digits;
}

function isEgyptianPhone(normalized: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalized);
}

function validate(body: SignupBody): { valid: boolean; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {};

  const fullName = (body.fullName || '').trim();
  if (!fullName) {
    fieldErrors.fullName = 'يرجى إدخال الاسم الكامل.';
  } else {
    const meaningfulWords = fullName
      .split(/\s+/)
      .filter((w) => w.replace(/[.\-_]/g, '').length >= 2);
    if (meaningfulWords.length < 2) {
      fieldErrors.fullName = 'يرجى إدخال الاسم الكامل (الاسم والعائلة).';
    }
  }

  const normalizedPhone = normalizePhone(body.phone || '');
  if (!body.phone || !body.phone.trim()) {
    fieldErrors.phone = 'يرجى إدخال رقم هاتف صحيح.';
  } else if (!isEgyptianPhone(normalizedPhone)) {
    fieldErrors.phone = 'يرجى إدخال رقم هاتف صحيح.';
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email) {
    fieldErrors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  } else if (!EMAIL_RE.test(email)) {
    fieldErrors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }

  if (!body.academicGrade) {
    fieldErrors.academicGrade = 'يرجى اختيار الصف الدراسي.';
  } else if (!ALLOWED_GRADES.includes(body.academicGrade)) {
    fieldErrors.academicGrade = 'يرجى اختيار الصف الدراسي.';
  }

  if (!body.governorate) {
    fieldErrors.governorate = 'يرجى اختيار المحافظة.';
  } else if (!ALLOWED_GOVERNORATES.includes(body.governorate)) {
    fieldErrors.governorate = 'يرجى اختيار المحافظة.';
  }

  if (!body.studySystem) {
    fieldErrors.studySystem = 'يرجى اختيار نظام الدراسة.';
  } else if (!ALLOWED_STUDY_SYSTEMS.includes(body.studySystem)) {
    fieldErrors.studySystem = 'يرجى اختيار نظام الدراسة.';
  }

  if (!body.password) {
    fieldErrors.password = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.';
  } else if (body.password.length < 8) {
    fieldErrors.password = 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.';
  }

  if (!body.confirmPassword) {
    fieldErrors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
  } else if (body.confirmPassword !== body.password) {
    fieldErrors.confirmPassword = 'كلمتا المرور غير متطابقتين.';
  }

  if (!body.acceptedTerms) {
    fieldErrors.acceptedTerms = 'يجب الموافقة على الشروط والأحكام وسياسة الخصوصية.';
  }

  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

function errorResponse(status: number, message: string, fieldErrors: FieldErrors = {}): Response {
  return new Response(
    JSON.stringify({ success: false, message, errors: fieldErrors }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
}

function successResponse(message: string, user: unknown): Response {
  return new Response(
    JSON.stringify({ success: true, message, data: { user } }),
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

  let body: SignupBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'بيانات غير صحيحة.');
  }

  const { valid, fieldErrors } = validate(body);
  if (!valid) {
    return errorResponse(422, 'يرجى تصحيح الأخطاء في النموذج.', fieldErrors);
  }

  const normalizedPhone = normalizePhone(body.phone!);
  const normalizedEmail = (body.email || '').trim().toLowerCase();
  const trimmedFullName = (body.fullName || '').trim();

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Duplicate phone check (service role bypasses RLS)
  const { data: existingPhone, error: phoneErr } = await adminClient
    .from('student_profiles')
    .select('id')
    .eq('phone', normalizedPhone)
    .maybeSingle();
  if (phoneErr) {
    return errorResponse(500, 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
  if (existingPhone) {
    return errorResponse(409, 'رقم الهاتف مسجل بالفعل.', {
      phone: 'رقم الهاتف مسجل بالفعل.',
    });
  }

  // Create the auth user (email uniqueness enforced by auth.users)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password: body.password!,
    email_confirm: true,
    user_metadata: { full_name: trimmedFullName },
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return errorResponse(409, 'هذا البريد الإلكتروني مسجل بالفعل.', {
        email: 'هذا البريد الإلكتروني مسجل بالفعل.',
      });
    }
    return errorResponse(500, 'حدث خطأ غير متوقع أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
  }

  const userId = authData.user.id;

  // Insert the profile row. On failure, delete the auth user to avoid orphan accounts.
  const { error: profileError } = await adminClient.from('student_profiles').insert({
    user_id: userId,
    full_name: trimmedFullName,
    phone: normalizedPhone,
    email: normalizedEmail,
    academic_grade: body.academicGrade,
    governorate: body.governorate,
    study_system: body.studySystem,
    accepted_terms_at: new Date().toISOString(),
  });

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    const pgMsg = profileError.message.toLowerCase();
    if (pgMsg.includes('student_profiles_phone_key') || pgMsg.includes('duplicate key') && pgMsg.includes('phone')) {
      return errorResponse(409, 'رقم الهاتف مسجل بالفعل.', { phone: 'رقم الهاتف مسجل بالفعل.' });
    }
    return errorResponse(500, 'حدث خطأ غير متوقع أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
  }

  // Confirm the user can sign in immediately (email_confirm already true above)
  void anonKey; // referenced to keep the anon key available for future use

  return successResponse('تم إنشاء حسابك بنجاح، يمكنك الآن تسجيل الدخول.', {
    id: userId,
    fullName: trimmedFullName,
    phone: normalizedPhone,
    email: normalizedEmail,
    academicGrade: body.academicGrade,
    governorate: body.governorate,
    studySystem: body.studySystem,
  });
});
