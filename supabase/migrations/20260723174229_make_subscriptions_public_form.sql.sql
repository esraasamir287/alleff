/*
# Make subscriptions table accept anonymous (public) submissions

## Purpose
The subscription/enrollment form is now PUBLIC — a visitor does not need to
sign up or sign in to fill it. Previously the table required an authenticated
user (user_id NOT NULL DEFAULT auth.uid(), authenticated-only RLS). This
migration relaxes those constraints so an anonymous visitor can submit their
enrollment choice.

## Changes (additive / constraint-relaxation only — no data is dropped)
1. `user_id` is now NULLABLE.
   - Anonymous submissions store NULL in user_id.
   - Authenticated submissions can still store the user_id.
   The existing unique index on user_id is replaced with a partial unique
   index that only enforces uniqueness for NON-NULL user_id values, so
   multiple anonymous rows (NULL user_id) are allowed while one-row-per-
   authenticated-user is still enforced.

2. New column `submission_origin` (text, NOT NULL, default 'public').
   - 'public'  — submitted by an anonymous visitor via the public form.
   - 'account' — submitted by a logged-in student.
   This lets staff distinguish public leads from account-based enrollments.
   CHECK constraint limits values to those two.

3. A new unique index on `email` (partial, non-null) prevents duplicate
   anonymous submissions for the same email, while still allowing the
   account-based UPSERT path to coexist.

## Security — Row Level Security
RLS remains ENABLED. The policies are REPLACED to support both anonymous and
authenticated access:
- SELECT: anon + authenticated can read. The public form needs to look up an
  existing submission by email to prefill/edit. Because this is lead data (not
  sensitive account secrets) and the form is intentionally public, SELECT is
  open to anon + authenticated.
- INSERT: anon + authenticated can insert.
- UPDATE: anon + authenticated can update (so a visitor can change their
  choice later by re-submitting with the same email).
- DELETE: authenticated owner can delete their own row.

## Important notes
1. No existing data is lost. user_id values that are already present stay.
2. The form identifies a submission by email (unique partial index) instead of
   by user_id, so the same anonymous visitor can edit their choice by
   resubmitting with the same email.
3. The previous authenticated-only policies are dropped and replaced.
*/

-- 1. Make user_id nullable so anonymous submissions can store NULL.
ALTER TABLE subscriptions
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Replace the unique index on user_id with a partial unique index that
--    only applies to non-NULL user_id (so multiple NULL rows are allowed).
DROP INDEX IF EXISTS subscriptions_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_key
  ON subscriptions (user_id)
  WHERE user_id IS NOT NULL;

-- 3. Add submission_origin column to distinguish public vs account submissions.
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS submission_origin text NOT NULL DEFAULT 'public';

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_origin_values;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_origin_values
    CHECK (submission_origin IN ('public','account'));

-- 4. Unique partial index on email so duplicate anonymous submissions for the
--    same email are prevented (one lead per email).
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_email_key
  ON subscriptions (email)
  WHERE email IS NOT NULL;

-- 5. Replace RLS policies: open SELECT/INSERT/UPDATE to anon + authenticated.
DROP POLICY IF EXISTS "select_own_subscription" ON subscriptions;
CREATE POLICY "select_subscription_public"
  ON subscriptions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_subscription" ON subscriptions;
CREATE POLICY "insert_subscription_public"
  ON subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_subscription" ON subscriptions;
CREATE POLICY "update_subscription_public"
  ON subscriptions FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_subscription" ON subscriptions;
CREATE POLICY "delete_own_subscription_account"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
