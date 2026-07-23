/*
# Store full student profile data on each subscription record

## Purpose
Each subscription row should capture the student's complete profile data
(academic grade + governorate) alongside the existing name/phone/email/
study_system fields, so staff see the full picture for every enrollment.

## Changes (additive only — no drops, renames, or type changes)
Added two nullable text columns to `subscriptions`:
- `academic_grade` — the student's academic grade (e.g. "الصف الأول الثانوي")
- `governorate`    — the student's governorate (e.g. "القاهرة")

Both are nullable because anonymous (public-form) submissions don't have a
profile and won't supply these values. Account-based submissions copy them
from `student_profiles` at save time.

## Security
RLS policies are unchanged. No data is dropped or renamed.
*/

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS academic_grade text;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS governorate text;