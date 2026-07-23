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

interface AnswerInput {
  questionId: string;
  selectedOptionId: string;
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
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول لتسليم الامتحان.' });
  }

  const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول لتسليم الامتحان.' });
  }
  const userId = userData.user.id;

  let body: { attemptId?: string; answers?: AnswerInput[] };
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { success: false, message: 'بيانات غير صحيحة.' });
  }

  const attemptId = (body.attemptId || '').trim();
  if (!attemptId) {
    return jsonResponse(400, { success: false, message: 'معرّف المحاولة مطلوب.' });
  }
  const answers = Array.isArray(body.answers) ? body.answers : [];
  if (answers.length === 0) {
    return jsonResponse(400, { success: false, message: 'لم يتم تقديم أي إجابات.' });
  }

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Fetch the attempt (service role) and verify ownership + in_progress status.
  const { data: attempt, error: attemptError } = await adminClient
    .from('exam_attempts')
    .select('id, exam_id, user_id, status, started_at')
    .eq('id', attemptId)
    .maybeSingle();

  if (attemptError || !attempt) {
    return jsonResponse(404, { success: false, message: 'المحاولة غير موجودة.' });
  }
  if (attempt.user_id !== userId) {
    // Generic error — do not reveal ownership state.
    return jsonResponse(403, { success: false, message: 'لا يمكنك الوصول إلى هذه المحاولة.' });
  }
  if (attempt.status === 'submitted') {
    return jsonResponse(409, { success: false, message: 'تم تسليم هذه المحاولة بالفعل ولا يمكن تعديلها.' });
  }

  // Study-system compatibility re-check before scoring: fetch the student's
  // profile and the exam's study_system. If they are incompatible, reject the
  // submission without creating any answer records.
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

  // Fetch all questions for this exam (service role) to validate answers.
  const { data: questions, error: questionsError } = await adminClient
    .from('questions')
    .select('id, points, display_order')
    .eq('exam_id', attempt.exam_id)
    .order('display_order', { ascending: true });

  if (questionsError || !questions) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  const questionIds = questions.map((q) => q.id);
  const questionPoints = new Map(questions.map((q) => [q.id, q.points as number]));
  const totalScore = questions.reduce((sum, q) => sum + (q.points as number), 0);

  // Fetch all options for these questions (service role) — this is where
  // is_correct is read server-side. It is NEVER returned to the client.
  const { data: options, error: optionsError } = await adminClient
    .from('question_options')
    .select('id, question_id, is_correct')
    .in('question_id', questionIds);

  if (optionsError || !options) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' });
  }

  // Build a lookup: optionId -> { questionId, isCorrect }
  const optionLookup = new Map(
    options.map((o) => [o.id as string, { questionId: o.question_id as string, isCorrect: o.is_correct as boolean }]),
  );

  // Validate every submitted answer against the real question/option data.
  const seenQuestions = new Set<string>();
  const answerRows: {
    attempt_id: string;
    question_id: string;
    selected_option_id: string;
    is_correct: boolean;
    awarded_points: number;
  }[] = [];
  let earnedScore = 0;

  for (const ans of answers) {
    if (!ans.questionId || !ans.selectedOptionId) {
      return jsonResponse(400, { success: false, message: 'بيانات الإجابة غير مكتملة.' });
    }
    if (seenQuestions.has(ans.questionId)) {
      return jsonResponse(400, { success: false, message: 'تم تقديم أكثر من إجابة لنفس السؤال.' });
    }
    seenQuestions.add(ans.questionId);

    const opt = optionLookup.get(ans.selectedOptionId);
    if (!opt) {
      return jsonResponse(400, { success: false, message: 'أحد الخيارات المحددة غير صالح.' });
    }
    if (opt.questionId !== ans.questionId) {
      return jsonResponse(400, { success: false, message: 'الخيار المحدد لا ينتمي إلى السؤال المذكور.' });
    }

    const points = questionPoints.get(ans.questionId) ?? 0;
    const isCorrect = opt.isCorrect;
    const awarded = isCorrect ? points : 0;
    earnedScore += awarded;

    answerRows.push({
      attempt_id: attemptId,
      question_id: ans.questionId,
      selected_option_id: ans.selectedOptionId,
      is_correct: isCorrect,
      awarded_points: awarded,
    });
  }

  const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 10000) / 100 : 0;

  // Fetch passing_percentage to determine pass/fail.
  const { data: examRow } = await adminClient
    .from('exams')
    .select('passing_percentage')
    .eq('id', attempt.exam_id)
    .maybeSingle();
  const passingPercentage = examRow?.passing_percentage ?? 60;
  const passed = percentage >= passingPercentage;

  // Insert all student_answers (service role bypasses RLS).
  const { error: insertAnswersError } = await adminClient
    .from('student_answers')
    .insert(answerRows);

  if (insertAnswersError) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ أثناء حفظ الإجابات. يرجى المحاولة مرة أخرى.' });
  }

  // Finalize the attempt: set status to submitted, record score + timestamp.
  const { error: finalizeError } = await adminClient
    .from('exam_attempts')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      score: earnedScore,
      total_score: totalScore,
      percentage,
    })
    .eq('id', attemptId)
    .eq('status', 'in_progress');

  if (finalizeError) {
    return jsonResponse(500, { success: false, message: 'حدث خطأ أثناء إنهاء التسليم. يرجى المحاولة مرة أخرى.' });
  }

  const correctCount = answerRows.filter((r) => r.is_correct).length;
  const incorrectCount = answerRows.length - correctCount;

  return jsonResponse(200, {
    success: true,
    message: passed
      ? 'أحسنت! لقد اجتزت الامتحان بنجاح.'
      : 'لم تصل إلى درجة النجاح هذه المرة. لا تيأس وحاول مرة أخرى.',
    data: {
      attemptId,
      score: earnedScore,
      totalScore,
      percentage,
      passingPercentage,
      passed,
      correctCount,
      incorrectCount,
      totalQuestions: questions.length,
    },
  });
});
