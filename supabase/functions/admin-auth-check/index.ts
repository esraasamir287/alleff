import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

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
      return jsonResponse(401, { success: false, isAdmin: false, message: 'يجب تسجيل الدخول.' });
    }

    // Verify the caller's JWT.
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonResponse(401, { success: false, isAdmin: false, message: 'يجب تسجيل الدخول.' });
    }

    // Read is_admin from auth.users raw_app_meta_data via service role — this
    // is always current, unlike the JWT which may be stale.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: authUser, error: metaError } = await adminClient
      .from('users')
      .select('raw_app_meta_data')
      .eq('id', userData.user.id)
      .single();

    if (metaError || !authUser) {
      return jsonResponse(200, { success: true, isAdmin: false });
    }

    const metaData = authUser.raw_app_meta_data as Record<string, unknown> | null;
    const isAdmin = metaData?.is_admin === true;

    return jsonResponse(200, { success: true, isAdmin });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
    return jsonResponse(500, { success: false, isAdmin: false, message });
  }
});
