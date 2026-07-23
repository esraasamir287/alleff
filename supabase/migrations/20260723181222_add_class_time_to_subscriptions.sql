/*
# Add class_time column to subscriptions for online slot selection

## Purpose
The new logged-in booking form lets an online student choose one of two
Thursday class times (9:00 or 11:00 AM) starting August 20. The existing
class_day column only stored the day of the week ('thursday'/'sunday').
This migration adds a class_time column to capture the chosen slot so the
specific time is persisted alongside the day.

## Changes (additive only — no drops, renames, or type changes)
Added column to `subscriptions`:
- `class_time` (text, nullable) — '09:00' or '11:00' when the student
  picks an online Thursday slot; NULL when the student chooses offline.
  Constrained by CHECK to those two values or NULL.

## Constraints added
- CHECK (class_time IN ('09:00','11:00') OR class_time IS NULL)

## Security
RLS policies are unchanged. No data is dropped or renamed.

## Important notes
1. class_time is only meaningful when wants_online is true; existing rows
   keep NULL and remain valid.
2. The application upserts on user_id, so a student changing their slot
   updates the same row rather than creating a duplicate.
*/

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS class_time text;

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_class_time_values;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_class_time_values
    CHECK (class_time IN ('09:00','11:00') OR class_time IS NULL);