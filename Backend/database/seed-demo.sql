USE edulearn_db;

-- Demo users
-- Passwords:
-- student@edulearn.com => Student@123
-- teacher@edulearn.com => Teacher@123
-- admin@edulearn.com   => Admin@123

INSERT INTO users (full_name, email, password_hash, role, status)
VALUES
  ('Student Demo', 'student@edulearn.com', '$2a$10$3zCQaciTc.0TQmRAW4JX5OqBJrHDn.8yOpx8.e80ZuYWnZQ0rg3.m', 'student', 'active'),
  ('Teacher Demo', 'teacher@edulearn.com', '$2a$10$kd6ccz.Khh4V5CmDF0j3bew4eQQMKPiJMLXPMgDdNElvAgn37NSTu', 'teacher', 'active'),
  ('Admin Demo', 'admin@edulearn.com', '$2a$10$IYF5XlUGs959JKHzZocCQeL0.MZZ9lWD0cSSUGObF8nS4PyaCEqvW', 'admin', 'active')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  role = VALUES(role),
  status = VALUES(status);

-- Demo course owned by teacher
INSERT INTO courses
(title, description, category, level, price, discount_price, thumbnail_url, instructor_id, is_published)
SELECT
  'React Frontend Mastery',
  'Build production-ready React applications with routing, state and API integration.',
  'Web Development',
  'Intermediate',
  59.99,
  39.99,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  u.id,
  1
FROM users u
WHERE u.email = 'teacher@edulearn.com'
AND NOT EXISTS (
  SELECT 1 FROM courses c WHERE c.title = 'React Frontend Mastery'
);

INSERT INTO courses
(title, description, category, level, price, discount_price, thumbnail_url, instructor_id, is_published)
SELECT
  'Digital Study Skills for University Success',
  'A free starter course focused on note taking, time management, revision strategy, and productive study habits.',
  'Academic Success',
  'Beginner',
  0.00,
  0.00,
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  u.id,
  1
FROM users u
WHERE u.email = 'teacher@edulearn.com'
AND NOT EXISTS (
  SELECT 1 FROM courses c WHERE c.title = 'Digital Study Skills for University Success'
);

-- Demo lessons
INSERT INTO course_lessons
(course_id, title, lesson_type, video_url, notes_content, sort_order, is_preview)
SELECT
  c.id,
  'Introduction to React',
  'mixed',
  'https://www.youtube.com/embed/Tn6-PIqc4UM',
  '<h5>React Basics</h5><p>Understand components, props, state and rendering flow.</p>',
  1,
  1
FROM courses c
WHERE c.title = 'React Frontend Mastery'
AND NOT EXISTS (
  SELECT 1
  FROM course_lessons l
  WHERE l.course_id = c.id AND l.title = 'Introduction to React'
);

INSERT INTO course_lessons
(course_id, title, lesson_type, video_url, notes_content, sort_order, is_preview)
SELECT
  c.id,
  'React Router and Protected Routes',
  'mixed',
  'https://www.youtube.com/embed/Ul3y1LXxzdU',
  '<h5>Routing</h5><p>Learn nested routes, params, and route protection by role.</p>',
  2,
  0
FROM courses c
WHERE c.title = 'React Frontend Mastery'
AND NOT EXISTS (
  SELECT 1
  FROM course_lessons l
  WHERE l.course_id = c.id AND l.title = 'React Router and Protected Routes'
);

INSERT INTO course_lessons
(course_id, title, lesson_type, video_url, notes_content, sort_order, is_preview)
SELECT
  c.id,
  'Build a Weekly Learning Plan',
  'mixed',
  'https://www.youtube.com/embed/H14bBuluwB8',
  '<h5>Study Planning</h5><p>Design a consistent weekly study routine with realistic time blocks and review checkpoints.</p>',
  1,
  1
FROM courses c
WHERE c.title = 'Digital Study Skills for University Success'
AND NOT EXISTS (
  SELECT 1
  FROM course_lessons l
  WHERE l.course_id = c.id AND l.title = 'Build a Weekly Learning Plan'
);

INSERT INTO course_quizzes
(course_id, title, description, passing_score)
SELECT
  c.id,
  'React Fundamentals Checkpoint',
  'A short checkpoint quiz covering components, routing, and protected content.',
  60.00
FROM courses c
WHERE c.title = 'React Frontend Mastery'
AND NOT EXISTS (
  SELECT 1
  FROM course_quizzes q
  WHERE q.course_id = c.id AND q.title = 'React Fundamentals Checkpoint'
);

INSERT INTO quiz_questions
(quiz_id, question_text, options_json, correct_option, explanation, sort_order)
SELECT
  q.id,
  'Which React feature is commonly used to switch between pages in a single-page application?',
  JSON_ARRAY('React Router', 'Redux', 'Webpack', 'Tailwind CSS'),
  0,
  'React Router is the library typically used for client-side navigation in React applications.',
  1
FROM course_quizzes q
WHERE q.title = 'React Fundamentals Checkpoint'
AND NOT EXISTS (
  SELECT 1
  FROM quiz_questions qq
  WHERE qq.quiz_id = q.id AND qq.sort_order = 1
);

INSERT INTO quiz_questions
(quiz_id, question_text, options_json, correct_option, explanation, sort_order)
SELECT
  q.id,
  'Why are protected routes useful in an e-learning platform?',
  JSON_ARRAY(
    'They improve image compression',
    'They restrict premium content to authorized learners',
    'They replace the need for a database',
    'They automatically create quizzes'
  ),
  1,
  'Protected routes help ensure only properly authorized users can access sensitive or premium content.',
  2
FROM course_quizzes q
WHERE q.title = 'React Fundamentals Checkpoint'
AND NOT EXISTS (
  SELECT 1
  FROM quiz_questions qq
  WHERE qq.quiz_id = q.id AND qq.sort_order = 2
);

-- Demo approved enrollment for student
INSERT INTO enrollments (user_id, course_id, status, progress)
SELECT s.id, c.id, 'approved', 25.00
FROM users s, courses c
WHERE s.email = 'student@edulearn.com'
  AND c.title = 'React Frontend Mastery'
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.user_id = s.id AND e.course_id = c.id
  );

INSERT INTO payments (user_id, course_id, amount, gateway, transaction_id, status, meta_json)
SELECT
  s.id,
  c.id,
  39.99,
  'telebirr',
  CONCAT('SEED-', c.id, '-', s.id),
  'completed',
  JSON_OBJECT('seeded', TRUE, 'source', 'demo')
FROM users s, courses c
WHERE s.email = 'student@edulearn.com'
  AND c.title = 'React Frontend Mastery'
  AND NOT EXISTS (
    SELECT 1 FROM payments p WHERE p.user_id = s.id AND p.course_id = c.id
  );
