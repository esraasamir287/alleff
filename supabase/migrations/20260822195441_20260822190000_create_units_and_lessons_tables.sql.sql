/*
# Create units and lessons tables for educational content

1. New Tables
- `units` — top-level curriculum units (e.g. "الوحدة الأولى").
  - id (uuid, PK)
  - title (text, not null)
  - unit_order (int, not null, default 1) — display order
  - created_at (timestamptz, default now())
- `lessons` — lessons inside a unit.
  - id (uuid, PK)
  - unit_id (uuid, FK -> units.id ON DELETE CASCADE)
  - title (text, not null)
  - lesson_order (int, not null, default 1) — display order
  - video_url (text, nullable) — optional video URL
  - pdf_url (text, nullable) — optional PDF URL
  - created_at (timestamptz, default now())

2. Indexes
- Index on lessons.unit_id for fast lookups.
- Index on units.unit_order and lessons.lesson_order for ordering.

3. Security
- Enable RLS on both tables.
- All CRUD restricted to authenticated users (admin-only section).
- No user_id column — content is shared/managed by admins, so any
  authenticated user with admin access (enforced by AdminRoute in the
  frontend + the admin-auth-check edge function) can manage it.
- The policies use `TO authenticated` with `USING (true)` because the
  content is shared admin-managed data, not per-user data. Access control
  is enforced by the admin route guard, not by row ownership.
*/

CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  unit_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  lesson_order int NOT NULL DEFAULT 1,
  video_url text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_units_order ON units(unit_order);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(lesson_order);

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Units policies (authenticated only — admin-managed shared content)
DROP POLICY IF EXISTS "select_units" ON units;
CREATE POLICY "select_units" ON units FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_units" ON units;
CREATE POLICY "insert_units" ON units FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_units" ON units;
CREATE POLICY "update_units" ON units FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_units" ON units;
CREATE POLICY "delete_units" ON units FOR DELETE
  TO authenticated USING (true);

-- Lessons policies (authenticated only — admin-managed shared content)
DROP POLICY IF EXISTS "select_lessons" ON lessons;
CREATE POLICY "select_lessons" ON lessons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_lessons" ON lessons;
CREATE POLICY "insert_lessons" ON lessons FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_lessons" ON lessons;
CREATE POLICY "update_lessons" ON lessons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_lessons" ON lessons;
CREATE POLICY "delete_lessons" ON lessons FOR DELETE
  TO authenticated USING (true);
