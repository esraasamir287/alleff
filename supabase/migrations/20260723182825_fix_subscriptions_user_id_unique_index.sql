/*
# Fix subscriptions upsert: replace partial user_id index with a full unique index

## Purpose
The logged-in booking form saves the student's choice with an upsert
(INSERT ... ON CONFLICT (user_id) DO UPDATE). The existing unique index on
user_id is PARTIAL (WHERE user_id IS NOT NULL). PostgreSQL cannot infer a
partial unique index as an ON CONFLICT arbiter unless the conflict clause
includes a matching WHERE predicate — which the Supabase JS client does not
generate. As a result every upsert failed with
"there is no unique or exclusion constraint matching the ON CONFLICT
specification" and no subscription row was ever written.

## Change (index swap only — no table data is touched)
1. Drop the partial unique index `subscriptions_user_id_key`.
2. Create a standard (non-partial) UNIQUE index on `user_id`.

A standard unique index in PostgreSQL treats multiple NULL values as
distinct, so anonymous submissions (NULL user_id) are still allowed in any
quantity, while one-row-per-authenticated-user is still enforced. Because the
index is no longer partial, ON CONFLICT (user_id) inference now succeeds and
the upsert writes/updates the row as expected.

## Security
RLS policies are unchanged. No columns or data are dropped, renamed, or
retyped.
*/

DROP INDEX IF EXISTS subscriptions_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_key
  ON subscriptions (user_id);