/*
# Create subscription_requests table + private payment-receipts storage bucket

1. New Tables
- `subscription_requests`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users ON DELETE CASCADE)
  - `package_name` (text, not null) — e.g. "الصف أولى عربي - 3 أشهر"
  - `price` (integer, not null) — amount in EGP
  - `payment_method` (text, not null) — 'instapay' or 'vodafone_cash'
  - `receipt_path` (text, not null) — storage object path inside payment-receipts bucket
  - `status` (text, not null, default 'pending') — pending / approved / rejected
  - `student_name` (text, nullable) — optional name the student entered
  - `created_at` (timestamptz, default now())

2. Security — RLS
- Enable RLS on subscription_requests.
- SELECT/INSERT/UPDATE/DELETE scoped to the owning authenticated user via auth.uid() = user_id.
- Admins later read/approve via the service role (bypasses RLS) or a SECURITY DEFINER function — not exposed here.

3. Storage
- Create private bucket `payment-receipts` (not public).
- Storage policies allow an authenticated user to upload + read only objects under their own user_id/ prefix.
- The table stores only the path; the binary lives in storage.

4. Important notes
- The image binary is NEVER stored in the table — only `receipt_path`.
- Admin opens the receipt securely via a signed URL generated server-side (service role), not a public URL.
- `user_id` defaults to auth.uid() so client inserts that omit it still pass the WITH CHECK.
*/

CREATE TABLE IF NOT EXISTS subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  price integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('instapay', 'vodafone_cash')),
  receipt_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  student_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscription_requests_user_id_idx ON subscription_requests(user_id);
CREATE INDEX IF NOT EXISTS subscription_requests_status_idx ON subscription_requests(status);

ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscription_requests" ON subscription_requests;
CREATE POLICY "select_own_subscription_requests"
  ON subscription_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscription_requests" ON subscription_requests;
CREATE POLICY "insert_own_subscription_requests"
  ON subscription_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscription_requests" ON subscription_requests;
CREATE POLICY "update_own_subscription_requests"
  ON subscription_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscription_requests" ON subscription_requests;
CREATE POLICY "delete_own_subscription_requests"
  ON subscription_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Private storage bucket for payment receipts (not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users manage only their own folder user_id/*
DROP POLICY IF EXISTS "receipts_upload_own" ON storage.objects;
CREATE POLICY "receipts_upload_own"
  ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "receipts_read_own" ON storage.objects;
CREATE POLICY "receipts_read_own"
  ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "receipts_delete_own" ON storage.objects;
CREATE POLICY "receipts_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
