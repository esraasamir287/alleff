/*
# Replace placeholder quiz content with real "امتحان كورس التأسيس"

## What this migration does
1. Adds a nullable `show_correct_answers` column to `exams` (defaults to false).
   Records exam-level intent to reveal correct answers only AFTER submission.
   Enforcement (rejecting review for in-progress or foreign attempts) lives in
   the quiz-review edge function.
2. Updates the existing placeholder exam row (id 11111111...1111) IN PLACE —
   no duplicate exam is created.
3. Deletes the 3 placeholder questions for this exam. question_options cascades
   automatically. Zero exam_attempts reference this exam, so no attempt data
   is lost.
4. Inserts 14 real single-choice questions (display_order 1..14, 1 point each)
   and 56 options (4 per question, display_order 1..4). Exactly one option per
   question is marked is_correct=true.

## Idempotency
- Exam update uses WHERE on the fixed placeholder id.
- Question/option inserts are guarded by NOT EXISTS on fixed ids.
- Placeholder deletion is a no-op if already gone.
*/

-- Step 1: add exam-level review flag (defaults false for safety)
ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS show_correct_answers boolean NOT NULL DEFAULT false;

-- Step 2: update the existing placeholder exam record in place
UPDATE exams
SET
  title = 'امتحان كورس التأسيس',
  description = 'اختبار لتحديد مستوى الطالب في أساسيات الكمبيوتر والشبكات',
  duration_minutes = 15,
  passing_percentage = 60,
  allowed_attempts = 1,
  access_type = 'public',
  is_published = true,
  show_correct_answers = true,
  updated_at = now()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Step 3: remove the 3 placeholder questions (cascades their 12 options).
-- No exam_attempts reference this exam, so no attempt cleanup is needed.
DELETE FROM questions
WHERE exam_id = '11111111-1111-1111-1111-111111111111'
  AND id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc'
  );

-- Step 4: insert the 14 real questions + 56 options.
-- Correct option per question (by display_order): 1->2, 2->3, 3->2, 4->3,
-- 5->3, 6->1, 7->3, 8->3, 9->2, 10->2, 11->3, 12->2, 13->2, 14->3.

-- Question 1
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما المقصود بجهاز الكمبيوتر؟', 'single_choice', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110001'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110001'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('جهاز يُستخدم لتخزين الملفات فقط', false, 1),
  ('جهاز إلكتروني يستقبل البيانات ويعالجها ويعرض النتائج', true, 2),
  ('جهاز يُستخدم للاتصال بالإنترنت فقط', false, 3),
  ('جهاز لا يعمل إلا باستخدام لوحة المفاتيح', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110001'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110001'::uuid);

-- Question 2
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'أي ترتيب يوضح دورة عمل الكمبيوتر بشكل صحيح؟', 'single_choice', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110002'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110002'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('الإخراج ← الإدخال ← التخزين ← المعالجة', false, 1),
  ('المعالجة ← التخزين ← الإدخال ← الإخراج', false, 2),
  ('الإدخال ← المعالجة ← الإخراج ← التخزين', true, 3),
  ('التخزين ← الإخراج ← المعالجة ← الإدخال', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110002'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110002'::uuid);

-- Question 3
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما الوظيفة الأساسية لوحدات الإدخال؟', 'single_choice', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110003'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110003'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('عرض النتائج للمستخدم', false, 1),
  ('إدخال البيانات والأوامر إلى الكمبيوتر', true, 2),
  ('حفظ البيانات بصورة دائمة', false, 3),
  ('توصيل الكمبيوتر بالإنترنت', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110003'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110003'::uuid);

-- Question 4
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110004'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'أي من الآتي يُعد من وحدات التخزين؟', 'single_choice', 1, 4
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110004'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110004'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('الميكروفون', false, 1),
  ('كاميرا الويب', false, 2),
  ('القرص الصلب', true, 3),
  ('السماعات', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110004'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110004'::uuid);

-- Question 5
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110005'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما المقصود بالـ Hardware؟', 'single_choice', 1, 5
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110005'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110005'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('البرامج والتعليمات غير الملموسة', false, 1),
  ('المواقع الموجودة على الإنترنت', false, 2),
  ('المكونات المادية التي يمكن لمسها ورؤيتها', true, 3),
  ('البيانات التي يتم تخزينها على الكمبيوتر', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110005'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110005'::uuid);

-- Question 6
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110006'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما المقصود بالذاكرة الرئيسية Primary Memory؟', 'single_choice', 1, 6
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110006'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110006'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('ذاكرة يستخدمها المعالج مباشرة أثناء تشغيل البرامج', true, 1),
  ('ذاكرة تستخدم لحفظ الملفات بصورة دائمة فقط', false, 2),
  ('ذاكرة موجودة داخل وحدات الإدخال', false, 3),
  ('ذاكرة لا يستطيع المعالج استخدامها', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110006'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110006'::uuid);

-- Question 7
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110007'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'أي من الآتي يُعد نوعًا من الذاكرة الرئيسية؟', 'single_choice', 1, 7
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110007'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110007'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('Flash Memory', false, 1),
  ('CD', false, 2),
  ('RAM', true, 3),
  ('Hard Disk', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110007'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110007'::uuid);

-- Question 8
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110008'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ماذا يحدث للبيانات الموجودة في RAM عند إيقاف تشغيل الكمبيوتر؟', 'single_choice', 1, 8
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110008'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110008'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('يتم نقلها تلقائيًا إلى الإنترنت', false, 1),
  ('تظل محفوظة دائمًا', false, 2),
  ('يتم حذفها أو فقدها', true, 3),
  ('تتحول إلى ملفات نصية', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110008'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110008'::uuid);

-- Question 9
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110009'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما الفائدة الأساسية من شبكة الكمبيوتر؟', 'single_choice', 1, 9
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110009'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110009'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('زيادة حجم شاشة الكمبيوتر', false, 1),
  ('مشاركة البيانات والموارد بين الأجهزة', true, 2),
  ('استبدال نظام التشغيل', false, 3),
  ('منع الأجهزة من الاتصال ببعضها', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110009'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110009'::uuid);

-- Question 10
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110010'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'أي مثال يعبّر عن شبكة LAN؟', 'single_choice', 1, 10
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110010'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110010'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('ربط فروع شركة في دول مختلفة', false, 1),
  ('ربط أجهزة معمل الكمبيوتر داخل المدرسة', true, 2),
  ('ربط جميع شبكات العالم', false, 3),
  ('الاتصال بين قارتين', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110010'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110010'::uuid);

-- Question 11
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110011'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'أي مثال يعبّر عن شبكة WAN؟', 'single_choice', 1, 11
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110011'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110011'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('ربط أجهزة معمل المدرسة', false, 1),
  ('ربط الهاتف بالراوتر داخل المنزل', false, 2),
  ('ربط فروع شركة في مدن مختلفة', true, 3),
  ('توصيل لوحة المفاتيح بالكمبيوتر', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110011'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110011'::uuid);

-- Question 12
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110012'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما هو الإنترنت؟', 'single_choice', 1, 12
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110012'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110012'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('جهاز يُستخدم لحفظ البيانات', false, 1),
  ('شبكة عالمية ضخمة تربط ملايين الأجهزة والشبكات', true, 2),
  ('برنامج لتصفح الصور فقط', false, 3),
  ('شبكة محلية داخل المنزل فقط', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110012'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110012'::uuid);

-- Question 13
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110013'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما المقصود ببروتوكول الاتصال؟', 'single_choice', 1, 13
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110013'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110013'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('جهاز يستخدم لتوصيل الشبكات', false, 1),
  ('مجموعة من القواعد التي تنظم تبادل البيانات بين الأجهزة', true, 2),
  ('برنامج يستخدم لتعديل الصور', false, 3),
  ('وحدة لتخزين الملفات', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110013'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110013'::uuid);

-- Question 14
INSERT INTO questions (id, exam_id, question_text, question_type, points, display_order)
SELECT '11111111-1111-1111-1111-111111110014'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ما الذي يمكن أن يحدده بروتوكول الاتصال؟', 'single_choice', 1, 14
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110014'::uuid);

INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT '11111111-1111-1111-1111-111111110014'::uuid, x.option_text, x.is_correct, x.display_order
FROM (VALUES
  ('لون جهاز الكمبيوتر', false, 1),
  ('حجم الشاشة', false, 2),
  ('طريقة تنسيق البيانات وإرسالها والتحقق من الأخطاء', true, 3),
  ('نوع لوحة المفاتيح فقط', false, 4)
) AS x(option_text, is_correct, display_order)
WHERE EXISTS (SELECT 1 FROM questions WHERE id = '11111111-1111-1111-1111-111111110014'::uuid)
AND NOT EXISTS (SELECT 1 FROM question_options WHERE question_id = '11111111-1111-1111-1111-111111110014'::uuid);
