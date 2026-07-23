/*
# Public Quiz schema — exams, questions, options, attempts, answers

## Purpose
Creates a scalable structure that supports Public Quiz now and Course Exams
later (via the `access_type` column). For this stage only `public` access is
used and enforced; Course Exam access logic is intentionally NOT built.

## New Tables

### exams
- id                 (uuid, PK, defaults to gen_random_uuid())
- title              (text, not null)
- description        (text, not null)
- access_type        (text, not null, default 'public') — supports 'public' and 'course'
- duration_minutes   (integer, nullable) — null = no time limit
- passing_percentage (integer, not null, default 60)
- allowed_attempts   (integer, not null, default 1) — 0 = unlimited
- is_published       (boolean, not null, default false)
- created_at         (timestamptz, default now())
- updated_at         (timestamptz, default now())

### questions
- id            (uuid, PK)
- exam_id       (uuid, FK -> exams(id) ON DELETE CASCADE)
- question_text (text, not null)
- question_type (text, not null, default 'single_choice')
- points        (integer, not null, default 1)
- display_order (integer, not null, default 0)
- created_at    (timestamptz, default now())
- updated_at    (timestamptz, default now())

### question_options
- id            (uuid, PK)
- question_id   (uuid, FK -> questions(id) ON DELETE CASCADE)
- option_text   (text, not null)
- is_correct    (boolean, not null, default false)
- display_order (integer, not null, default 0)

### exam_attempts
- id                 (uuid, PK)
- exam_id            (uuid, FK -> exams(id) ON DELETE CASCADE)
- user_id            (uuid, FK -> auth.users(id) ON DELETE CASCADE, DEFAULT auth.uid())
- started_at         (timestamptz, not null, default now())
- submitted_at       (timestamptz, nullable)
- score              (integer, not null, default 0)
- total_score        (integer, not null, default 0)
- percentage         (numeric(5,2), not null, default 0)
- status             (text, not null, default 'in_progress') — 'in_progress' | 'submitted'
- created_at         (timestamptz, default now())
- updated_at         (timestamptz, default now())

### student_answers
- id                 (uuid, PK)
- attempt_id         (uuid, FK -> exam_attempts(id) ON DELETE CASCADE)
- question_id        (uuid, FK -> questions(id) ON DELETE CASCADE)
- selected_option_id (uuid, FK -> question_options(id) ON DELETE SET NULL)
- is_correct         (boolean, not null, default false)
- awarded_points     (integer, not null, default 0)
- created_at         (timestamptz, default now())

## Indexes
- questions: index on exam_id + display_order
- question_options: index on question_id + display_order
- exam_attempts: index on user_id for fast "my attempts" lookups
- student_answers: unique on (attempt_id, question_id) — one answer per question
  per attempt; index on attempt_id

## Security — Row Level Security

### exams
- ENABLE RLS.
- SELECT policy for authenticated users: can read only published public exams
  (access_type = 'public' AND is_published = true). Admin-side management is
  out of scope and handled via service-role edge functions.

### questions
- ENABLE RLS. NO client-facing policies. The anon/authenticated roles CANNOT
  read questions directly. Questions are served ONLY through the quiz-start
  edge function (service role), which strips `is_correct` from the response.

### question_options
- ENABLE RLS. NO client-facing policies, for the same reason as questions.
  `is_correct` is never exposed to the frontend.

### exam_attempts
- ENABLE RLS. Owner-scoped CRUD (user_id = auth.uid()):
  - SELECT/INSERT/UPDATE/DELETE: only own attempts.
  - The "no update after submitted" guard is enforced in the quiz-submit edge
    function (status check before any write).

### student_answers
- ENABLE RLS. Owner-scoped via ownership of the parent attempt (EXISTS subquery
  on exam_attempts.user_id = auth.uid()) for all CRUD verbs.

## Important notes
1. `is_correct` on question_options is the source of truth for grading and is
   ONLY readable by the service role. The frontend never receives it.
2. Score is calculated server-side in the quiz-submit edge function.
3. The unique constraint on student_answers(attempt_id, question_id) prevents
   two answers for the same question in one attempt.
4. Placeholder questions are inserted in a SEPARATE migration so they can be
   removed in one step without touching the schema.
5. No real educational content is inserted.
6. updated_at triggers keep timestamps current on exams, questions, and
   exam_attempts.
*/

-- ========== exams ==========
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  access_type text NOT NULL DEFAULT 'public',
  duration_minutes integer,
  passing_percentage integer NOT NULL DEFAULT 60,
  allowed_attempts integer NOT NULL DEFAULT 1,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS exams_set_updated_at ON exams;
CREATE TRIGGER exams_set_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_published_public_exams" ON exams;
CREATE POLICY "select_published_public_exams"
  ON exams FOR SELECT
  TO authenticated
  USING (access_type = 'public' AND is_published = true);

-- ========== questions ==========
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'single_choice',
  points integer NOT NULL DEFAULT 1,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_exam_id_display_order_idx
  ON questions (exam_id, display_order);

DROP TRIGGER IF EXISTS questions_set_updated_at ON questions;
CREATE TRIGGER questions_set_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- ========== question_options ==========
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS question_options_question_id_display_order_idx
  ON question_options (question_id, display_order);

ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- ========== exam_attempts ==========
CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  percentage numeric(5,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exam_attempts_user_id_idx
  ON exam_attempts (user_id);

DROP TRIGGER IF EXISTS exam_attempts_set_updated_at ON exam_attempts;
CREATE TRIGGER exam_attempts_set_updated_at
  BEFORE UPDATE ON exam_attempts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_exam_attempts" ON exam_attempts;
CREATE POLICY "select_own_exam_attempts"
  ON exam_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_exam_attempts" ON exam_attempts;
CREATE POLICY "insert_own_exam_attempts"
  ON exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_exam_attempts" ON exam_attempts;
CREATE POLICY "update_own_exam_attempts"
  ON exam_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_exam_attempts" ON exam_attempts;
CREATE POLICY "delete_own_exam_attempts"
  ON exam_attempts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== student_answers ==========
CREATE TABLE IF NOT EXISTS student_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct boolean NOT NULL DEFAULT false,
  awarded_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS student_answers_attempt_question_idx
  ON student_answers (attempt_id, question_id);

CREATE INDEX IF NOT EXISTS student_answers_attempt_id_idx
  ON student_answers (attempt_id);

ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_student_answers" ON student_answers;
CREATE POLICY "select_own_student_answers"
  ON student_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = student_answers.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_student_answers" ON student_answers;
CREATE POLICY "insert_own_student_answers"
  ON student_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = student_answers.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_student_answers" ON student_answers;
CREATE POLICY "update_own_student_answers"
  ON student_answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = student_answers.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = student_answers.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_student_answers" ON student_answers;
CREATE POLICY "delete_own_student_answers"
  ON student_answers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exam_attempts
      WHERE exam_attempts.id = student_answers.attempt_id
        AND exam_attempts.user_id = auth.uid()
    )
  );
