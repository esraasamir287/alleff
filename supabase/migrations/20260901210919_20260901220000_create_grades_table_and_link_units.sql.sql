/*
# Add grades table as top-level hierarchy for educational content

1. New Tables
- `grades` — academic years / grades (e.g. "الصف الأول الثانوي").
  - id (uuid, PK)
  - title (text, NOT NULL) — display name in Arabic
  - slug (text, NOT NULL, UNIQUE) — short stable key (e.g. "first-secondary")
  - grade_order (int, NOT NULL, default 1) — display order
  - created_at (timestamptz, default now())

2. Modified Tables
- `units` — add nullable `grade_id` column (uuid, FK -> grades.id ON DELETE SET NULL).
  Existing units get assigned to a default "unassigned" grade so they remain visible.
  The column is nullable so the migration is safe even if no grades exist yet.

3. Seed Data
- Three default grades inserted: First Secondary, Second Secondary, Third Secondary.
- Existing units are linked to the First Secondary grade by default (so nothing disappears).

4. Indexes
- Index on grades.grade_order for sorting.
- Index on units.grade_id for fast grade-scoped queries.

5. Security
- Enable RLS on grades.
- Policies: TO authenticated, USING (true) — content is shared admin-managed data,
  access control enforced by AdminRoute + admin-auth-check edge function (same model
  as units/lessons/lesson_resources).

6. Important Notes
- The existing lessons.video_url and lessons.pdf_url columns are left untouched.
- The lesson_resources table already supports unlimited videos/PDFs per lesson.
- Student profiles still use the free-text academic_grade column; linking profiles
  to grades.id is a separate future step. For now grades are used for content org.
*/

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  grade_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grades_order ON grades(grade_order);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_grades" ON grades;
CREATE POLICY "select_grades" ON grades FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_grades" ON grades;
CREATE POLICY "insert_grades" ON grades FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_grades" ON grades;
CREATE POLICY "update_grades" ON grades FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_grades" ON grades;
CREATE POLICY "delete_grades" ON grades FOR DELETE
  TO authenticated USING (true);

-- Add grade_id to units (nullable for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'units' AND column_name = 'grade_id'
  ) THEN
    ALTER TABLE units ADD COLUMN grade_id uuid REFERENCES grades(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_units_grade_id ON units(grade_id);

-- Seed default grades
INSERT INTO grades (title, slug, grade_order)
VALUES
  ('الصف الأول الثانوي', 'first-secondary', 1),
  ('الصف الثاني الثانوي', 'second-secondary', 2),
  ('الصف الثالث الثانوي', 'third-secondary', 3)
ON CONFLICT (slug) DO NOTHING;

-- Link existing units to the first grade so nothing disappears
UPDATE units
SET grade_id = (SELECT id FROM grades WHERE slug = 'first-secondary' LIMIT 1)
WHERE grade_id IS NULL;