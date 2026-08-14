import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const VALID_STATUSES = new Set(['pending', 'approved', 'rejected']);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
  }

  // Verify the caller's JWT.
  const userClient: SupabaseClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse(401, { success: false, message: 'يجب تسجيل الدخول.' });
  }

  // Admin check — read live app_metadata via GoTrue admin API (service role)
  // instead of trusting the JWT, which may be stale if is_admin was set after
  // the token was issued.
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

  // GET .../admin-subscriptions  → list all requests
  if (req.method === 'GET') {
    const { data, error } = await adminClient
      .from('subscription_requests')
      .select('id, user_id, package_name, price, payment_method, receipt_path, status, student_name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return jsonResponse(500, { success: false, message: 'تعذر تحميل الطلبات.' });
    }
    return jsonResponse(200, { success: true, data });
  }

  // POST .../admin-subscriptions  { receiptPath }  → signed URL
  if (req.method === 'POST') {
    let body: { receiptPath?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { success: false, message: 'بيانات غير صحيحة.' });
    }
    const receiptPath = (body.receiptPath || '').trim();
    if (!receiptPath) {
      return jsonResponse(400, { success: false, message: 'مسار الإيصال مطلوب.' });
    }

    const { data, error } = await adminClient.storage
      .from('payment-receipts')
      .createSignedUrl(receiptPath, 60);

    if (error || !data?.signedUrl) {
      return jsonResponse(500, { success: false, message: 'تعذر إنشاء رابط الإيصال.' });
    }
    return jsonResponse(200, { success: true, data: { signedUrl: data.signedUrl } });
  }

  // PATCH .../admin-subscriptions  { requestId, status }  → update status
  if (req.method === 'PATCH') {
    let body: { requestId?: string; status?: string };
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { success: false, message: 'بيانات غير صحيحة.' });
    }
    const requestId = (body.requestId || '').trim();
    const newStatus = (body.status || '').trim();

    if (!requestId) {
      return jsonResponse(400, { success: false, message: 'معرف الطلب مطلوب.' });
    }
    if (!VALID_STATUSES.has(newStatus)) {
      return jsonResponse(400, { success: false, message: 'حالة غير صحيحة.' });
    }

    const { data, error } = await adminClient
      .from('subscription_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select('id, status')
      .single();

    if (error || !data) {
      return jsonResponse(500, { success: false, message: 'تعذّر تحديث حالة الطلب.' });
    }
    return jsonResponse(200, { success: true, data });
  }

  return jsonResponse(405, { success: false, message: 'الطريقة غير مسموح بها.' });
});
