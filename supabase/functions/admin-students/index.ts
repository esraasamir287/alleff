import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (req.method !== 'GET') {
    return jsonResponse(405, { success: false, message: 'الطريقة غير مسموح بها.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
  }

  const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
  }

  const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: adminUserData, error: adminUserError } =
    await adminClient.auth.admin.getUserById(userData.user.id);
  if (adminUserError || !adminUserData?.user) {
    return jsonResponse(403, { success: false, message: 'هذه الصفحة مخصصة للمشرفين فقط.' });
  }
  const isAdmin =
    (adminUserData.user.app_metadata as Record<string, unknown> | null)?.is_admin === true;
  if (!isAdmin) {
    return jsonResponse(403, { success: false, message: 'هذه الصفحة مخصصة للمشرفين فقط.' });
  }

  const { data, error } = await adminClient
    .from('student_profiles')
    .select(
      'id, user_id, full_name, phone, email, academic_grade, study_system, governorate, created_at',
    )
    .order('created_at', { ascending: false });

  if (error) {
    return jsonResponse(500, { success: false, message: 'تعذر تحميل بيانات الطلاب.' });
  }

  return jsonResponse(200, { success: true, data: data ?? [] });
});
