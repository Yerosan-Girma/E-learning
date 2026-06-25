-- Performance indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_language ON courses(language);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_courses_total_students ON courses(total_students DESC);

-- Indexes for course_lessons table
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);

-- Indexes for course_quizzes table
CREATE INDEX IF NOT EXISTS idx_course_quizzes_course_id ON course_quizzes(course_id);

-- Indexes for enrollments table
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_id, status);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_course_status ON payments(course_id, status);

-- Full-text search indexes for courses
CREATE INDEX IF NOT EXISTS idx_courses_title_gin ON courses USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_description_gin ON courses USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_courses_category_gin ON courses USING gin(to_tsvector('english', category));
CREATE INDEX IF NOT EXISTS idx_courses_tags_gin ON courses USING gin(to_tsvector('english', tags));
