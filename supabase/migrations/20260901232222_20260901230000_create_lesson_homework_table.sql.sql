/*
# Create lesson_homework table for per-lesson homework

1. New Tables
- `lesson_homework` — optional homework attached to a lesson (one-to-one).
  - id (uuid, PK)
  - lesson_id (uuid, FK -> lessons.id ON DELETE CASCADE, UNIQUE) — one homework per lesson
  - title (text, NOT NULL) — homework title
  - instructions (text, NOT NULL) — instructions text for students
  - due_date (date, nullable) — optional due date
  - created_at (timestamptz, default now())
  - updated_at (timestamptz, default now())

2. Indexes
- Unique index on lesson_homework.lesson_id (enforces one homework per lesson).

3. Security
- Enable RLS on lesson_homework.
- All CRUD restricted to authenticated users (same admin-managed shared content
  model as lessons/lesson_resources). Policies use TO authenticated with
  USING (true) because content is shared admin-managed data, not per-user data.

4. Backward Compatibility
- Fully additive — no existing tables or columns are modified.
- Lessons without a homework row simply have no homework.
*/

CREATE TABLE IF NOT EXISTS lesson_homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_homework_lesson_id ON lesson_homework(lesson_id);

ALTER TABLE lesson_homework ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lesson_homework" ON lesson_homework;
CREATE POLICY "select_lesson_homework" ON lesson_homework FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_lesson_homework" ON lesson_homework;
CREATE POLICY "insert_lesson_homework" ON lesson_homework FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_lesson_homework" ON lesson_homework;
CREATE POLICY "update_lesson_homework" ON lesson_homework FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_lesson_homework" ON lesson_homework;
CREATE POLICY "delete_lesson_homework" ON lesson_homework FOR DELETE
  TO authenticated USING (true);