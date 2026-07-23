/*
# Create student_profiles table for student authentication

## Purpose
Stores the extended student information that is NOT part of Supabase's built-in
auth.users table. Supabase Auth handles email + password (hashing, uniqueness,
session management); this table holds the student-specific fields requested by
the product: full name, phone, academic grade, governorate, and the timestamp
of accepting the terms & privacy policy.

## New Tables
- `student_profiles`
  - `id`                (uuid, primary key, defaults to gen_random_uuid())
  - `user_id`           (uuid, not null, references auth.users(id) ON DELETE CASCADE,
                        uniquely indexed — one profile per auth user)
  - `full_name`         (text, not null) — trimmed full name
  - `phone`             (text, not null, unique) — normalized Egyptian mobile
                        number in the format 01XXXXXXXXX (11 digits)
  - `email`             (text, not null) — normalized lowercase email, kept in
                        sync with auth.users.email for convenient lookup. A
                        unique index is intentionally NOT added here because
                        auth.users.email is already unique; the profile table
                        relies on the 1:1 link to auth.users.
  - `academic_grade`    (text, not null) — one of the approved grade option
                        values (e.g. "second")
  - `governorate`       (text, not null) — one of the approved governorate names
  - `accepted_terms_at` (timestamptz, not null) — timestamp of terms acceptance
  - `created_at`        (timestamptz, default now())
  - `updated_at`        (timestamptz, default now())

## Indexes
- `student_profiles_user_id_key` UNIQUE on `user_id` (one profile per auth user)
- `student_profiles_phone_key`   UNIQUE on `phone`   (no duplicate phone numbers)
- `student_profiles_email_idx`   on `email`          (faster lookup by email)

## Security — Row Level Security
RLS is ENABLED. The table is locked to all roles until policies are added.

Four separate owner-scoped policies are created (one per CRUD verb), all scoped
to `TO authenticated` and using `auth.uid() = user_id` as the ownership check:
1. `select_own_student_profile`  — SELECT
2. `insert_own_student_profile`  — INSERT (WITH CHECK auth.uid() = user_id)
3. `update_own_student_profile`  — UPDATE (USING + WITH CHECK auth.uid() = user_id)
4. `delete_own_student_profile`  — DELETE

A student can therefore only ever read or modify the single profile row that
belongs to them. Cross-profile access is denied by RLS. Anonymous (logged-out)
users have no policies on this table and therefore cannot read or write it.

## Important notes
1. Passwords are NEVER stored in this table. Supabase Auth's auth.users table
   holds the bcrypt-hashed password. This table contains profile data only.
2. `confirmPassword` is NEVER stored anywhere — it is used for client-side
   validation only.
3. The `accepted_terms_at` timestamp records WHEN the student accepted the
   terms & privacy policy; it is NOT a substitute for authentication data.
4. The `email` column is a denormalized copy of auth.users.email kept for
   convenient phone->email lookups during login. The source of truth for
   email uniqueness is auth.users.email.
5. The edge function that creates profiles runs with the service role key and
   therefore bypasses RLS to insert the row on behalf of the just-created auth
   user. Client-side reads/writes are still subject to the RLS policies above.
*/

CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  academic_grade text NOT NULL,
  governorate text NOT NULL,
  accepted_terms_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One profile per auth user
CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_user_id_key
  ON student_profiles (user_id);

-- No duplicate phone numbers across the whole table
CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_phone_key
  ON student_profiles (phone);

-- Faster email-based lookups (login resolves phone -> email)
CREATE INDEX IF NOT EXISTS student_profiles_email_idx
  ON student_profiles (email);

-- Automatically keep updated_at in sync on row update
DROP TRIGGER IF EXISTS student_profiles_set_updated_at ON student_profiles;
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_profiles_set_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Owner-scoped policies: a student can only access their own profile row.
DROP POLICY IF EXISTS "select_own_student_profile" ON student_profiles;
CREATE POLICY "select_own_student_profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_student_profile" ON student_profiles;
CREATE POLICY "insert_own_student_profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_student_profile" ON student_profiles;
CREATE POLICY "update_own_student_profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_student_profile" ON student_profiles;
CREATE POLICY "delete_own_student_profile"
  ON student_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
