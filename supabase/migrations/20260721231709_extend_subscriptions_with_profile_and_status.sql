/*
# Extend subscriptions with student profile + status fields

## Purpose
Persist the subscriber's identity and profile snapshot alongside their
enrollment choice so each row is self-contained:
user_id, full_name, email, phone, study_system, class_day (selected day),
subscription_status, and timestamps.

## Changes (additive only — no drops, renames, or type changes)
Added columns to `subscriptions`:
- full_name           text
- email               text
- phone               text
- study_system        text   (nullable — matches profile.study_system)
- subscription_status text

After backfilling any existing rows from `student_profiles`, the identity
columns are set NOT NULL and constraints are added.

## Constraints added
- CHECK (subscription_status IN ('subscribed','not_subscribed'))
- CHECK tying status to the enrollment choice:
  (wants_online = true  AND subscription_status = 'subscribed')
  OR
  (wants_online = false AND subscription_status = 'not_subscribed')

## Duplicate prevention
Already enforced by the existing unique index `subscriptions_user_id_key`
on user_id, combined with the app-level UPSERT (onConflict: 'user_id').
No new index needed.

## Notes
RLS policies are unchanged. No data is dropped or renamed.
*/

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS study_system text,
  ADD COLUMN IF NOT EXISTS subscription_status text;

UPDATE subscriptions s
SET
  full_name           = COALESCE(s.full_name, p.full_name),
  email               = COALESCE(s.email, p.email),
  phone               = COALESCE(s.phone, p.phone),
  study_system        = COALESCE(s.study_system, p.study_system::text),
  subscription_status = COALESCE(
    s.subscription_status,
    CASE WHEN s.wants_online THEN 'subscribed' ELSE 'not_subscribed' END
  )
FROM student_profiles p
WHERE p.user_id = s.user_id;

UPDATE subscriptions
SET subscription_status = CASE WHEN wants_online THEN 'subscribed' ELSE 'not_subscribed' END
WHERE subscription_status IS NULL;

ALTER TABLE subscriptions
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN subscription_status SET NOT NULL;

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_values;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_status_values
    CHECK (subscription_status IN ('subscribed','not_subscribed'));

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_status_matches_online;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_status_matches_online
    CHECK ( (wants_online = true  AND subscription_status = 'subscribed')
         OR (wants_online = false AND subscription_status = 'not_subscribed') );