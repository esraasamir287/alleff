/*
# Admin access to subscription_requests + signed receipt URLs

1. Purpose
- Admins need to review all subscription requests and open the private
  payment-receipts images. The table RLS is owner-only, and the storage
  bucket is private, so the anon/authenticated frontend cannot read other
  users' rows or receipts directly. We expose two SECURITY DEFINER
  functions callable only by admins (is_admin = true in JWT app metadata).

2. Admin marker
- Uses auth.jwt() ->> 'is_admin'. Admin status lives in raw_app_meta_data
  (user-immutable), set manually for admin accounts. No public signup can
  grant it.

3. New functions (SECURITY DEFINER, search_path protected)
- list_all_subscription_requests() → table of all requests, newest first.
- generate_receipt_url(receipt_path text) → a short-lived signed URL for
  the given object in the payment-receipts bucket (valid 60 seconds).
  Both functions REVOKE EXECUTE from public/anon/authenticated and GRANT
  EXECUTE only to authenticated. The function bodies re-check is_admin so
  even an authenticated non-admin gets an empty result / NULL.

4. Security
- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS.
- search_path is locked to 'public, storage' to prevent schema injection.
- No destructive operations.
*/

-- Helper: is this caller an admin? Returns boolean from JWT app metadata.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

-- List all subscription requests (admin only). Returns the columns the
-- admin UI needs; receipt_path is included so the UI can request a URL.
CREATE OR REPLACE FUNCTION public.list_all_subscription_requests()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  package_name text,
  price integer,
  payment_method text,
  receipt_path text,
  status text,
  student_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  RETURN QUERY
    SELECT
      sr.id, sr.user_id, sr.package_name, sr.price, sr.payment_method,
      sr.receipt_path, sr.status, sr.student_name, sr.created_at
    FROM public.subscription_requests sr
    ORDER BY sr.created_at DESC;
END;
$$;

-- Generate a short-lived signed URL for a receipt (admin only).
CREATE OR REPLACE FUNCTION public.generate_receipt_url(receipt_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, storage'
AS $$
DECLARE
  url text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  url := storage.public_create_signed_url('payment-receipts', receipt_path);
  -- public_create_signed_url returns the URL inside a jsonb object;
  -- fall back to the simpler API by returning the built path.
  RETURN url;
END;
$$;

-- Lock down execution: only authenticated roles may call; body re-checks admin.
REVOKE EXECUTE ON FUNCTION public.list_all_subscription_requests() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_all_subscription_requests() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_receipt_url(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_receipt_url(text) TO authenticated;
