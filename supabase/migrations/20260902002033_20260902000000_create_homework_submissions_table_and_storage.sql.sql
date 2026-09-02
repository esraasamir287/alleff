/*
# Create homework_submissions table + public storage bucket

1. New Tables
- `homework_submissions`
  - `id` (uuid, primary key)
  - `homework_id` (uuid, foreign key → lesson_homework.id ON DELETE CASCADE)
  - `student_id` (uuid, not null, defaults to auth.uid(), foreign key → auth.users.id ON DELETE CASCADE)
  - `file_url` (text, not null) — public URL of the uploaded file in storage
  - `file_path` (text, not null) — storage path within the bucket
  - `submitted_at` (timestamptz, defaults to now())

2. Security — RLS
- Enable RLS on `homework_submissions`.
- Owner-scoped CRUD: each authenticated student can only access their own submissions (auth.uid() = student_id).
- student_id defaults to auth.uid() so inserts that omit it still satisfy the WITH CHECK.

3. Storage
- Create public bucket `homework-submissions` (if not exists).
- Allow authenticated users to upload to and read from the bucket.
*/

CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES lesson_homework(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_path text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_homework_submissions" ON homework_submissions;
CREATE POLICY "select_own_homework_submissions"
ON homework_submissions FOR SELECT
TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "insert_own_homework_submissions" ON homework_submissions;
CREATE POLICY "insert_own_homework_submissions"
ON homework_submissions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "update_own_homework_submissions" ON homework_submissions;
CREATE POLICY "update_own_homework_submissions"
ON homework_submissions FOR UPDATE
TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "delete_own_homework_submissions" ON homework_submissions;
CREATE POLICY "delete_own_homework_submissions"
ON homework_submissions FOR DELETE
TO authenticated USING (auth.uid() = student_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-submissions', 'homework-submissions', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "auth_upload_homework_submissions" ON storage.objects;
CREATE POLICY "auth_upload_homework_submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homework-submissions');

DROP POLICY IF EXISTS "auth_read_homework_submissions" ON storage.objects;
CREATE POLICY "auth_read_homework_submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'homework-submissions');

DROP POLICY IF EXISTS "auth_delete_own_homework_submissions" ON storage.objects;
CREATE POLICY "auth_delete_own_homework_submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'homework-submissions' AND owner = auth.uid());

CREATE INDEX IF NOT EXISTS idx_homework_submissions_homework_student
ON homework_submissions (homework_id, student_id);
