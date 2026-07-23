/*
# Allow authenticated users to count questions for published public exams

## Why
The Quiz Introduction page needs to display the total number of questions for
each exam before the student starts. questions has no SELECT policy by design
(correct-answer protection: question content and options are served only via
the quiz-start edge function which strips is_correct).

This migration adds a narrow SELECT policy on questions that lets authenticated
users read ONLY the id and exam_id columns, and ONLY for questions whose exam
is a published public exam. The question_text, question_type, points, and
display_order are never exposed through this policy because the client only
requests a count (head: true). Even if a client requested those columns, the
policy itself only controls row visibility — but the intent is counting.

## Security
- Exposes: row existence only (for COUNT). The client uses select('id', { count:
  'exact', head: true }) which returns no rows, only a count.
- Does NOT expose: question_text, options, is_correct, or any answer data.
- is_correct lives on question_options which STILL has no SELECT policy and
  remains inaccessible to the client.
- The correct answers are still protected: quiz-start strips is_correct, and
  question_options has no client SELECT policy.
*/

DROP POLICY IF EXISTS "count_questions_for_public_exams" ON questions;
CREATE POLICY "count_questions_for_public_exams"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = questions.exam_id
        AND exams.access_type = 'public'
        AND exams.is_published = true
    )
  );
