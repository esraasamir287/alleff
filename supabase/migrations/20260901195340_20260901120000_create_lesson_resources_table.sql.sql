/*
# Create lesson_resources table for multi-resource lessons

1. New Tables
- `lesson_resources` — individual resources (videos or PDFs) attached to a lesson.
  - id (uuid, PK)
  - lesson_id (uuid, FK -> lessons.id ON DELETE CASCADE)
  - resource_type (text, NOT NULL, CHECK in 'video','pdf') — whether this is a video or PDF
  - title (text, NOT NULL) — display title for the resource
  - url (text, NOT NULL) — the resource URL
  - resource_order (int, NOT NULL, default 1) — display order within the lesson
  - created_at (timestamptz, default now())

2. Indexes
- Index on lesson_resources.lesson_id for fast lookups.
- Index on lesson_resources.resource_order for ordering.

3. Security
- Enable RLS on lesson_resources.
- All CRUD restricted to authenticated users (same admin-managed shared content
  model as lessons table). Policies use TO authenticated with USING (true)
  because content is shared admin-managed data, not per-user data.

4. Backward Compatibility
- The existing lessons.video_url and lessons.pdf_url columns remain untouched.
- This table is additive — existing single-video/single-PDF lessons continue to work.
- The frontend will be updated to use lesson_resources as the primary source,
  with fallback to the legacy columns for any lessons that still use them.
*/

CREATE TABLE IF NOT EXISTS lesson_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('video', 'pdf')),
  title text NOT NULL,
  url text NOT NULL,
  resource_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_order ON lesson_resources(resource_order);

ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lesson_resources" ON lesson_resources;
CREATE POLICY "select_lesson_resources" ON lesson_resources FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_lesson_resources" ON lesson_resources;
CREATE POLICY "insert_lesson_resources" ON lesson_resources FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_lesson_resources" ON lesson_resources;
CREATE POLICY "update_lesson_resources" ON lesson_resources FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_lesson_resources" ON lesson_resources;
CREATE POLICY "delete_lesson_resources" ON lesson_resources FOR DELETE
  TO authenticated USING (true);