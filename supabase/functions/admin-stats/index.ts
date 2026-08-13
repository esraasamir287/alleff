import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';

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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
    }

    // Verify the caller's JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
    }

    // Admin check — read live app_metadata via GoTrue admin API.
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

    // Gather statistics in parallel.
    const [
      profilesRes,
      pendingRequestsRes,
      approvedRequestsRes,
      rejectedRequestsRes,
      totalRequestsRes,
      attemptsRes,
      passedAttemptsRes,
      subscriptionsRes,
    ] = await Promise.all([
      adminClient.from('student_profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminClient.from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      adminClient.from('subscription_requests').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      adminClient.from('subscription_requests').select('*', { count: 'exact', head: true }),
      adminClient.from('exam_attempts').select('*', { count: 'exact', head: true }),
      adminClient.from('exam_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('percentage', 50),
      adminClient.from('subscriptions').select('*', { count: 'exact', head: true }),
    ]);

    const stats = {
      totalStudents: profilesRes.count ?? 0,
      subscriptionRequests: {
        pending: pendingRequestsRes.count ?? 0,
        approved: approvedRequestsRes.count ?? 0,
        rejected: rejectedRequestsRes.count ?? 0,
        total: totalRequestsRes.count ?? 0,
      },
      quizAttempts: attemptsRes.count ?? 0,
      passedAttempts: passedAttemptsRes.count ?? 0,
      activeSubscriptions: subscriptionsRes.count ?? 0,
    };

    return jsonResponse(200, { success: true, data: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
    return jsonResponse(500, { success: false, message });
  }
});
