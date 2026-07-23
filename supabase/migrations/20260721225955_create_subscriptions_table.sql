/*
# Create subscriptions table for student enrollment choices

## Purpose
Stores each student's subscription/enrollment preference for the paid online
course. A logged-in student answers whether they want to enroll online (Yes/No),
and if Yes, picks a weekly live-class day (Thursday or Sunday at 9:00 AM).

## New Tables
- `subscriptions`
  - `id`              (uuid, primary key, defaults to gen_random_uuid())
  - `user_id`         (uuid, not null, defaults to auth.uid(), references
                      auth.users(id) ON DELETE CASCADE, uniquely indexed —
                      one subscription row per student)
  - `wants_online`    (boolean, not null) — true if the student enrolled online
  - `class_day`       (text, nullable) — 'thursday' or 'sunday' when
                      wants_online is true; NULL when wants_online is false.
                      Constrained by CHECK to those two values or NULL.
  - `created_at`      (timestamptz, default now())
  - `updated_at`      (timestamptz, default now())

## Constraints
- CHECK (class_day IN ('thursday','sunday') OR class_day IS NULL)
- CHECK ( (wants_online = true AND class_day IS NOT NULL)
        OR (wants_online = false AND class_day IS NULL) )
  Ensures a day is selected exactly when online enrollment is requested.

## Indexes
- `subscriptions_user_id_key` UNIQUE on `user_id` (one row per student)

## Security — Row Level Security
RLS is ENABLED. Four separate owner-scoped policies (one per CRUD verb),
all scoped to `TO authenticated` with `auth.uid() = user_id`:
1. `select_own_subscription`  — SELECT
2. `insert_own_subscription`  — INSERT (WITH CHECK auth.uid() = user_id)
3. `update_own_subscription`  — UPDATE (USING + WITH CHECK auth.uid() = user_id)
4. `delete_own_subscription`  — DELETE

Anonymous (logged-out) users have no policies and cannot read or write.
The `user_id` column defaults to `auth.uid()` so client inserts that omit
`user_id` still satisfy the INSERT WITH CHECK.

## Important notes
1. One row per student enforced by the unique index on `user_id`.
2. Re-submitting the form performs an UPSERT (insert on conflict update),
   allowing the student to change their enrollment choice later.
3. class_day is only meaningful when wants_online is true; the CHECK
   constraint keeps the two fields consistent.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  wants_online boolean NOT NULL,
  class_day text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_class_day_values
    CHECK (class_day IN ('thursday','sunday') OR class_day IS NULL),
  CONSTRAINT subscriptions_online_requires_day
    CHECK ( (wants_online = true AND class_day IS NOT NULL)
         OR (wants_online = false AND class_day IS NULL) )
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_key
  ON subscriptions (user_id);

-- updated_at maintenance trigger
DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscription" ON subscriptions;
CREATE POLICY "select_own_subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscription" ON subscriptions;
CREATE POLICY "insert_own_subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscription" ON subscriptions;
CREATE POLICY "update_own_subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscription" ON subscriptions;
CREATE POLICY "delete_own_subscription"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);