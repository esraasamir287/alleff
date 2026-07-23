/*
# PLACEHOLDER DATA — Public Quiz test content (REMOVE BEFORE PRODUCTION)

## WARNING — DEVELOPMENT ONLY
This migration inserts ONE public exam and exactly THREE clearly-marked
placeholder questions (with options) so the Public Quiz interface can be tested
end-to-end. These are NOT real educational questions.

## How to remove later
Run the companion migration `remove_quiz_placeholder_data` which deletes the
exam with id = '11111111-1111-1111-1111-111111111111'. Because questions and
question_options have ON DELETE CASCADE foreign keys to exams/questions,
deleting the exam removes all three placeholder questions and all their
options in one step. Real exam content can then be inserted independently.

## Content inserted
- 1 exam: "الامتحان التجريبي العام" (access_type='public', is_published=true,
  duration 15 minutes, passing 60%, 3 attempts allowed)
- 3 placeholder single-choice questions (1 point each), each with 4 options.
- The correct option for each question is flagged with is_correct=true on the
  server side; this flag is never exposed to the frontend.
*/

DO $$
BEGIN
  -- Idempotent: only insert if the placeholder exam does not already exist.
  IF NOT EXISTS (SELECT 1 FROM exams WHERE id = '11111111-1111-1111-1111-111111111111') THEN
    INSERT INTO exams (id, title, description, access_type, duration_minutes, passing_percentage, allowed_attempts, is_published)
    VALUES (
      '11111111-1111-1111-1111-111111111111',
      'الامتحان التجريبي العام',
      'هذا امتحان تجريبي عام لأغراض الاختبار فقط. يحتوي على ثلاثة أسئلة تجريبية ولا يحتوي على محتوى تعليمي حقيقي.',
      'public',
      15,
      60,
      3,
      true
    );

    -- Placeholder question 1
    INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
    VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      '11111111-1111-1111-1111-111111111111',
      'سؤال تجريبي 1: ما هو الرقم التالي في النمط ٢، ٤، ٦، ...؟',
      'single_choice', 1, 1
    );
    INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '٧', false, 1),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '٨', true, 2),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '٩', false, 3),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '١٠', false, 4);

    -- Placeholder question 2
    INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
    VALUES (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      '11111111-1111-1111-1111-111111111111',
      'سؤال تجريبي 2: أي مما يلي يُعد لغة برمجة؟',
      'single_choice', 1, 2
    );
    INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HTML', false, 1),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CSS', false, 2),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Python', true, 3),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HTTP', false, 4);

    -- Placeholder question 3
    INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
    VALUES (
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      '11111111-1111-1111-1111-111111111111',
      'سؤال تجريبي 3: كم عدد أركان الصلاة؟',
      'single_choice', 1, 3
    );
    INSERT INTO question_options (question_id, option_text, is_correct, display_order) VALUES
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'أربعة عشر', true, 1),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'اثنا عشر', false, 2),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ستة عشر', false, 3),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'عشرة', false, 4);
  END IF;
END $$;
