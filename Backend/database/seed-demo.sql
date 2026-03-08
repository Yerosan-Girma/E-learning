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
(title, description, category, price, discount_price, thumbnail_url, instructor_id, is_published)
SELECT
  'React Frontend Mastery',
  'Build production-ready React applications with routing, state and API integration.',
  'Web Development',
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

-- Demo approved enrollment for student
INSERT INTO enrollments (user_id, course_id, status, progress)
SELECT s.id, c.id, 'approved', 25.00
FROM users s, courses c
WHERE s.email = 'student@edulearn.com'
  AND c.title = 'React Frontend Mastery'
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.user_id = s.id AND e.course_id = c.id
  );
