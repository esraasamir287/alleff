/*
# Add study_system to student_profiles and exams

## Purpose
Introduce a required study-system classification for students and exams so
that Arabic-system students see only Arabic exams and Languages-system
students see only Languages exams. The single existing exam is classified as
Arabic. No Languages exam is created in this migration.

## student_profiles.study_system
- Added as nullable text (no default, no NOT NULL).
- CHECK constraint restricts to 'arabic' | 'languages' | NULL.
- Nullable so the 1 existing profile is not broken. The application will
  route existing users with NULL study_system to a profile-completion screen
  before allowing quiz access. NOT NULL will be applied later only after every
  existing profile has a valid value.
- No value is guessed or backfilled here.

## exams.study_system
- Added as nullable text initially (safe for the existing row), then set to
  NOT NULL with NO DEFAULT after the existing exam is explicitly classified.
- CHECK constraint restricts to 'arabic' | 'languages' | 'all'.
- 'all' is allowed for a future exam intentionally available to both systems.
- There is NO default: every new exam MUST explicitly specify study_system,
  so an exam created without a value is rejected by the database. This
  prevents an unintentional "visible to everyone" exam.
- The single existing exam is set to 'arabic'.

## RLS on exams
- The old policy `select_published_public_exams` (any authenticated user sees
  any published public exam) is replaced with a study-system-aware policy.
- A student may read only published public exams whose study_system matches
  their own profile's study_system, OR whose study_system is 'all'.
- If the student has no profile row, the subquery returns NULL and no exam is
  returned.
- If the student's study_system is NULL, `study_system = NULL` is never true,
  so no exam is returned. The profile-completion flow stays accessible because
  it does not depend on the exams query.
- Correct-answer security is unchanged: question_options still has no SELECT
  policy and is served only through edge functions that strip is_correct.

## Data safety
- No tables are dropped or recreated.
- No columns are dropped or renamed.
- No users, profiles, attempts, questions, options, or answers are deleted.
- No authentication credentials or sessions are touched.
*/

-- Step 1: add study_system to student_profiles (nullable, constrained)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS study_system text;

ALTER TABLE student_profiles
  DROP CONSTRAINT IF EXISTS student_profiles_study_system_check;
ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_study_system_check
  CHECK (study_system IN ('arabic', 'languages') OR study_system IS NULL);

-- Step 2: add study_system to exams (nullable first, classify, then NOT NULL)
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS study_system text;

ALTER TABLE exams
  DROP CONSTRAINT IF EXISTS exams_study_system_check;
ALTER TABLE exams
  ADD CONSTRAINT exams_study_system_check
  CHECK (study_system IN ('arabic', 'languages', 'all'));

-- Step 3: classify the single existing exam as Arabic
UPDATE exams
SET study_system = 'arabic',
    updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 4: enforce NOT NULL on exams.study_system (all existing rows now have
-- a value). No default is added, so every future exam MUST specify it.
UPDATE exams
SET study_system = 'arabic',
    updated_at = now()
WHERE study_system IS NULL;

ALTER TABLE exams
  ALTER COLUMN study_system SET NOT NULL;

-- Step 5: replace the exams SELECT policy with a study-system-aware one.
-- Drop the old permissive policy.
DROP POLICY IF EXISTS "select_published_public_exams" ON exams;

-- New policy: only published public exams matching the student's study_system
-- (or study_system = 'all'). A missing profile or NULL study_system yields no
-- rows because the subquery returns NULL and `study_system = NULL` is never
-- true.
CREATE POLICY "select_published_public_exams_by_study_system"
  ON exams FOR SELECT
  TO authenticated
  USING (
    access_type = 'public'
    AND is_published = true
    AND (
      study_system = 'all'
      OR study_system = (
        SELECT sp.study_system
        FROM student_profiles sp
        WHERE sp.user_id = auth.uid()
      )
    )
  );
