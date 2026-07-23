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
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول لعرض المراجعة.' });
  }

  // Verify the caller's JWT.
  const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول لعرض المراجعة.' });
  }
  const userId = userData.user.id;

  let body: { attemptId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { success: false, message: 'بيانات غير صحيحة.' });
  }
  const attemptId = (body.attemptId || '').trim();
  if (!attemptId) {
    return jsonResponse(400, { success: false, message: 'معرّف المحاولة مطلوب.' });
  }

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch the attempt (service role) and verify ownership + submitted status.
  const { data: attempt, error: attemptError } = await adminClient
    .from('exam_attempts')
    .select('id, exam_id, user_id, status, score, total_score, percentage, submitted_at')
    .eq('id', attemptId)
    .maybeSingle();

  if (attemptError || !attempt) {
    return jsonResponse(404, { success: false, message: 'المحاولة غير موجودة.' });
  }
  // Ownership check — generic error, do not reveal ownership state.
  if (attempt.user_id !== userId) {
    return jsonResponse(403, { success: false, message: 'لا يمكنك الوصول إلى هذه المحاولة.' });
  }
  // Review is ONLY available after submission. In-progress attempts are rejected.
  if (attempt.status !== 'submitted') {
    return jsonResponse(403, { success: false, message: 'لا يمكن عرض المراجعة قبل تسليم الامتحان.' });
  }

  // Study-system compatibility check: verify the student's profile
  // study_system matches the exam's study_system (or is 'all'). This prevents
  // a student from reviewing an exam they shouldn't have access to, even if
  // an attempt somehow exists.
  const { data: profile } = await adminClient
    .from('student_profiles')
    .select('study_system')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile || !profile.study_system) {
    return jsonResponse(403, { success: false, message: 'هذا الامتحان غير متاح لنظام دراستك.' });
  }

  const { data: examStudySystem } = await adminClient
    .from('exams')
    .select('study_system')
    .eq('id', attempt.exam_id)
    .maybeSingle();

  if (!examStudySystem || (examStudySystem.study_system !== 'all' && examStudySystem.study_system !== profile.study_system)) {
    return jsonResponse(403, { success: false, message: 'هذا الامتحان غير متاح لنظام دراستك.' });
  }

  // Check exam-level show_correct_answers flag.
  const { data: examRow } = await adminClient
    .from('exams')
    .select('show_correct_answers')
    .eq('id', attempt.exam_id)
    .maybeSingle();
  if (!examRow?.show_correct_answers) {
    return jsonResponse(403, { success: false, message: 'مراجعة الإجابات غير متاحة لهذا الامتحان.' });
  }

  // Fetch questions for this exam (service role).
  const { data: questions, error: questionsError } = await adminClient
    .from('questions')
    .select('id, question_text, points, display_order')
    .eq('exam_id', attempt.exam_id)
    .order('display_order', { ascending: true });

  if (questionsError || !questions) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  const questionIds = questions.map((q) => q.id);

  // Fetch options (service role) — is_correct is included here because the
  // attempt is already submitted and the exam allows answer review.
  const { data: options, error: optionsError } = await adminClient
    .from('question_options')
    .select('id, question_id, option_text, is_correct, display_order')
    .in('question_id', questionIds)
    .order('display_order', { ascending: true });

  if (optionsError || !options) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  // Fetch the student's answers for this attempt (service role).
  const { data: answers, error: answersError } = await adminClient
    .from('student_answers')
    .select('question_id, selected_option_id, is_correct, awarded_points')
    .eq('attempt_id', attemptId);

  if (answersError || !answers) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  const answerMap = new Map(answers.map((a) => [a.question_id as string, a]));

  const reviewItems = questions.map((q) => {
    const ans = answerMap.get(q.id);
    const qOptions = options
      .filter((o) => o.question_id === q.id)
      .map((o) => ({
        id: o.id,
        optionText: o.option_text,
        displayOrder: o.display_order,
        isCorrect: o.is_correct,
      }));
    return {
      questionId: q.id,
      questionText: q.question_text,
      points: q.points,
      displayOrder: q.display_order,
      options: qOptions,
      selectedOptionId: ans?.selected_option_id ?? null,
      isCorrect: ans?.is_correct ?? false,
      awardedPoints: ans?.awarded_points ?? 0,
      answered: !!ans,
    };
  });

  return jsonResponse(200, {
    success: true,
    message: 'تم تحميل مراجعة الإجابات.',
    data: {
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalScore: attempt.total_score,
        percentage: Number(attempt.percentage),
        submittedAt: attempt.submitted_at,
      },
      review: reviewItems,
    },
  });
});
