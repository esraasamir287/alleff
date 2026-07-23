import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse(405, { success: false, message: 'الطريقة غير مسموح بها.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول للوصول إلى الامتحان.' });
  }

  // Verify the caller's JWT using the anon-key client (getUser validates the token).
  const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول للوصول إلى الامتحان.' });
  }
  const userId = userData.user.id;

  let body: { examId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { success: false, message: 'بيانات غير صحيحة.' });
  }
  const examId = (body.examId || '').trim();
  if (!examId) {
    return jsonResponse(400, { success: false, message: 'معرّف الامتحان مطلوب.' });
  }

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch the exam (service role bypasses RLS). Only allow published public exams.
  const { data: exam, error: examError } = await adminClient
    .from('exams')
    .select('id, title, description, access_type, duration_minutes, passing_percentage, allowed_attempts, is_published')
    .eq('id', examId)
    .maybeSingle();

  if (examError || !exam) {
    return jsonResponse(404, { success: false, message: 'الامتحان غير موجود.' });
  }
  if (exam.access_type !== 'public' || !exam.is_published) {
    return jsonResponse(403, { success: false, message: 'هذا الامتحان غير متاح حاليًا.' });
  }

  // Study-system compatibility check: fetch the student's profile and verify
  // the exam's study_system matches their own or is 'all'. This is enforced
  // here (service role bypasses RLS) and also at the database level via the
  // exams SELECT policy. A null profile study_system means the student has
  // not completed their profile yet — reject.
  const { data: profile } = await adminClient
    .from('student_profiles')
    .select('study_system')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile || !profile.study_system) {
    return jsonResponse(403, { success: false, message: 'هذا الامتحان غير متاح لنظام دراستك.' });
  }

  // Fetch the exam's study_system (not in the initial select to keep it lean).
  const { data: examStudySystem } = await adminClient
    .from('exams')
    .select('study_system')
    .eq('id', examId)
    .maybeSingle();

  if (!examStudySystem || (examStudySystem.study_system !== 'all' && examStudySystem.study_system !== profile.study_system)) {
    return jsonResponse(403, { success: false, message: 'هذا الامتحان غير متاح لنظام دراستك.' });
  }

  // Enforce allowed_attempts (0 = unlimited).
  const { data: priorAttempts, error: attemptCountError } = await adminClient
    .from('exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('exam_id', examId)
    .eq('user_id', userId);

  if (attemptCountError) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }
  const attemptCount = priorAttempts?.length ?? 0;
  void priorAttempts;
  if (exam.allowed_attempts > 0 && attemptCount >= exam.allowed_attempts) {
    return jsonResponse(403, {
      success: false,
      message: `لقد استخدمت جميع المحاولات المسموح بها لهذا الامتحان (${exam.allowed_attempts}).`,
    });
  }

  // Fetch questions (service role) — strip is_correct from the response.
  const { data: questions, error: questionsError } = await adminClient
    .from('questions')
    .select('id, question_text, question_type, points, display_order')
    .eq('exam_id', examId)
    .order('display_order', { ascending: true });

  if (questionsError || !questions) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  const questionIds = questions.map((q) => q.id);

  // Fetch options (service role) — strip is_correct from the response.
  const { data: options, error: optionsError } = await adminClient
    .from('question_options')
    .select('id, question_id, option_text, display_order')
    .in('question_id', questionIds)
    .order('display_order', { ascending: true });

  if (optionsError || !options) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  // Create a new attempt for this user.
  const { data: attempt, error: attemptError } = await adminClient
    .from('exam_attempts')
    .insert({ exam_id: examId, user_id: userId, status: 'in_progress' })
    .select('id, started_at')
    .single();

  if (attemptError || !attempt) {
    return jsonResponse(500, { success: false, message: 'تعذّر بدء الامتحان. يرجى المحاولة مرة أخرى.' });
  }

  // Assemble the public-facing payload: questions + options WITHOUT is_correct.
  const questionsWithOptions = questions.map((q) => ({
    id: q.id,
    questionText: q.question_text,
    questionType: q.question_type,
    points: q.points,
    displayOrder: q.display_order,
    options: options
      .filter((o) => o.question_id === q.id)
      .map((o) => ({
        id: o.id,
        optionText: o.option_text,
        displayOrder: o.display_order,
      })),
  }));

  return jsonResponse(200, {
    success: true,
    message: 'تم بدء الامتحان بنجاح.',
    data: {
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMinutes: exam.duration_minutes,
        passingPercentage: exam.passing_percentage,
        allowedAttempts: exam.allowed_attempts,
      },
      attempt: {
        id: attempt.id,
        startedAt: attempt.started_at,
      },
      questions: questionsWithOptions,
    },
  });
});
