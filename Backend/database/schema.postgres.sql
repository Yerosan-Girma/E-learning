-- PostgreSQL Schema Conversion for E-Learning Platform
-- Converted from MySQL schema (schema.sql)
-- Author: PostgreSQL Migration Task 3.1
-- Date: Generated automatically during migration

-- Notes on Conversion:
-- 1. AUTO_INCREMENT columns converted to SERIAL (or BIGSERIAL for BIGINT)
-- 2. ENUM columns converted to VARCHAR with CHECK constraints
-- 3. TINYINT(1) columns converted to BOOLEAN
-- 4. JSON columns converted to JSONB (PostgreSQL's optimized JSON type)
-- 5. LONGTEXT columns converted to TEXT (unlimited length in PostgreSQL)
-- 6. Removed MySQL-specific syntax (ENGINE, CHARSET, etc.)
-- 7. Added triggers for automatic updated_at updates (replaces ON UPDATE CURRENT_TIMESTAMP)
-- 8. Used SERIAL for all primary key auto-increment columns

-- ===========================================
-- Table: users
-- Original: CREATE TABLE IF NOT EXISTS users (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- ENUM('student', 'teacher', 'admin') converted to VARCHAR + CHECK constraint
  role VARCHAR(20) NOT NULL DEFAULT 'student' 
    CHECK (role IN ('student', 'teacher', 'admin')),
  
  -- ENUM('active', 'inactive') converted to VARCHAR + CHECK constraint  
  status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Remove MySQL ON UPDATE CURRENT_TIMESTAMP, will use trigger instead
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comments for documentation
COMMENT ON TABLE users IS 'System users table (students, teachers, administrators)';
COMMENT ON COLUMN users.role IS 'User role: student, teacher, or admin (converted from MySQL ENUM)';
COMMENT ON COLUMN users.status IS 'User status: active or inactive (converted from MySQL ENUM)';
COMMENT ON COLUMN users.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: courses
-- Original: CREATE TABLE IF NOT EXISTS courses (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  title VARCHAR(180) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL DEFAULT 'All Levels',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_price DECIMAL(10,2),
  thumbnail_url VARCHAR(500),
  instructor_id INTEGER NOT NULL,
  
  -- TINYINT(1) converted to BOOLEAN
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_courses_instructor 
    FOREIGN KEY (instructor_id) 
    REFERENCES users(id)
);

COMMENT ON TABLE courses IS 'Courses available in the e-learning platform';
COMMENT ON COLUMN courses.is_published IS 'Course publication status (converted from MySQL TINYINT(1))';
COMMENT ON COLUMN courses.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: course_lessons
-- Original: CREATE TABLE IF NOT EXISTS course_lessons (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS course_lessons (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  course_id INTEGER NOT NULL,
  title VARCHAR(180) NOT NULL,
  
  -- ENUM('video', 'note', 'mixed') converted to VARCHAR + CHECK constraint
  lesson_type VARCHAR(10) NOT NULL DEFAULT 'mixed' 
    CHECK (lesson_type IN ('video', 'note', 'mixed')),
    
  video_url VARCHAR(500),
  
  -- LONGTEXT converted to TEXT (unlimited length in PostgreSQL)
  notes_content TEXT,
  
  attachment_url VARCHAR(500),
  module_name VARCHAR(120),
  sort_order INTEGER NOT NULL DEFAULT 1,
  
  -- TINYINT(1) converted to BOOLEAN
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_lessons_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE course_lessons IS 'Individual lessons within courses';
COMMENT ON COLUMN course_lessons.lesson_type IS 'Lesson type: video, note, or mixed (converted from MySQL ENUM)';
COMMENT ON COLUMN course_lessons.notes_content IS 'Lesson content (converted from MySQL LONGTEXT)';
COMMENT ON COLUMN course_lessons.is_preview IS 'Preview lesson flag (converted from MySQL TINYINT(1))';
COMMENT ON COLUMN course_lessons.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: enrollments
-- Original: CREATE TABLE IF NOT EXISTS enrollments (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  
  -- ENUM('pending', 'approved', 'rejected') converted to VARCHAR + CHECK constraint
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
    
  progress DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP,
  
  -- Convert UNIQUE KEY to UNIQUE constraint
  CONSTRAINT uniq_user_course UNIQUE (user_id, course_id),
  
  CONSTRAINT fk_enroll_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_enroll_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE enrollments IS 'User enrollments in courses';
COMMENT ON COLUMN enrollments.status IS 'Enrollment status: pending, approved, or rejected (converted from MySQL ENUM)';

-- ===========================================
-- Table: payments
-- Original: CREATE TABLE IF NOT EXISTS payments (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,  -- Was BIGINT AUTO_INCREMENT PRIMARY KEY
  
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- ENUM('telebirr', 'bank_transfer', 'cash') converted to VARCHAR + CHECK constraint
  gateway VARCHAR(20) NOT NULL DEFAULT 'telebirr' 
    CHECK (gateway IN ('telebirr', 'bank_transfer', 'cash')),
    
  transaction_id VARCHAR(120),
  
  -- ENUM('initiated', 'pending', 'completed', 'failed') converted to VARCHAR + CHECK constraint
  status VARCHAR(20) NOT NULL DEFAULT 'initiated' 
    CHECK (status IN ('initiated', 'pending', 'completed', 'failed')),
    
  screenshot_path VARCHAR(500),
  
  -- JSON converted to JSONB (PostgreSQL optimized JSON type)
  meta_json JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payment_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id),
    
  CONSTRAINT fk_payment_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id)
);

COMMENT ON TABLE payments IS 'Payment transactions for course enrollments';
COMMENT ON COLUMN payments.gateway IS 'Payment gateway: telebirr, bank_transfer, or cash (converted from MySQL ENUM)';
COMMENT ON COLUMN payments.status IS 'Payment status: initiated, pending, completed, or failed (converted from MySQL ENUM)';
COMMENT ON COLUMN payments.meta_json IS 'Payment metadata (converted from MySQL JSON to PostgreSQL JSONB)';
COMMENT ON COLUMN payments.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: lesson_views
-- Original: CREATE TABLE IF NOT EXISTS lesson_views (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS lesson_views (
  id BIGSERIAL PRIMARY KEY,  -- Was BIGINT AUTO_INCREMENT PRIMARY KEY
  
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  
  -- TINYINT(1) converted to BOOLEAN
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Convert UNIQUE KEY to UNIQUE constraint
  CONSTRAINT uniq_user_lesson UNIQUE (user_id, lesson_id),
  
  CONSTRAINT fk_lesson_view_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_lesson_view_lesson 
    FOREIGN KEY (lesson_id) 
    REFERENCES course_lessons(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE lesson_views IS 'Track user lesson views and completion status';
COMMENT ON COLUMN lesson_views.completed IS 'Lesson completion status (converted from MySQL TINYINT(1))';

-- ===========================================
-- Table: course_quizzes
-- Original: CREATE TABLE IF NOT EXISTS course_quizzes (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS course_quizzes (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  
  course_id INTEGER NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  passing_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_quiz_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE course_quizzes IS 'Quizzes associated with courses';
COMMENT ON COLUMN course_quizzes.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: quiz_questions
-- Original: CREATE TABLE IF NOT EXISTS quiz_questions (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,  -- Was INT AUTO_INCREMENT PRIMARY KEY
  
  quiz_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  
  -- JSON converted to JSONB (PostgreSQL optimized JSON type)
  options_json JSONB NOT NULL,
  
  correct_option INTEGER NOT NULL,
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_question_quiz 
    FOREIGN KEY (quiz_id) 
    REFERENCES course_quizzes(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE quiz_questions IS 'Individual questions within quizzes';
COMMENT ON COLUMN quiz_questions.options_json IS 'Question options as JSON array (converted from MySQL JSON to PostgreSQL JSONB)';
COMMENT ON COLUMN quiz_questions.updated_at IS 'Automatically updated on row modification via trigger';

-- ===========================================
-- Table: quiz_attempts
-- Original: CREATE TABLE IF NOT EXISTS quiz_attempts (...)
-- ===========================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGSERIAL PRIMARY KEY,  -- Was BIGINT AUTO_INCREMENT PRIMARY KEY
  
  quiz_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  
  -- JSON converted to JSONB (PostgreSQL optimized JSON type)
  answers_json JSONB,
  
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_attempt_quiz 
    FOREIGN KEY (quiz_id) 
    REFERENCES course_quizzes(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_attempt_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE quiz_attempts IS 'User attempts at quiz completion';
COMMENT ON COLUMN quiz_attempts.answers_json IS 'User answers as JSON (converted from MySQL JSON to PostgreSQL JSONB)';

-- ===========================================
-- Trigger Function for automatic updated_at updates
-- Replaces MySQL's ON UPDATE CURRENT_TIMESTAMP
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ===========================================
-- Apply triggers to all tables with updated_at columns
-- ===========================================

-- Users table trigger
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Courses table trigger
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Course lessons table trigger
CREATE TRIGGER update_course_lessons_updated_at 
  BEFORE UPDATE ON course_lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Payments table trigger
CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Course quizzes table trigger
CREATE TRIGGER update_course_quizzes_updated_at 
  BEFORE UPDATE ON course_quizzes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Quiz questions table trigger
CREATE TRIGGER update_quiz_questions_updated_at 
  BEFORE UPDATE ON quiz_questions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Create indexes for better query performance
-- ===========================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Course indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published);

-- Course lessons indexes
CREATE INDEX idx_lessons_course ON course_lessons(course_id);
CREATE INDEX idx_lessons_type ON course_lessons(lesson_type);
CREATE INDEX idx_lessons_preview ON course_lessons(is_preview);

-- Enrollment indexes
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Payment indexes
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_course ON payments(course_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Lesson view indexes
CREATE INDEX idx_lesson_views_user ON lesson_views(user_id);
CREATE INDEX idx_lesson_views_lesson ON lesson_views(lesson_id);
CREATE INDEX idx_lesson_views_completed ON lesson_views(completed);

-- Quiz indexes
CREATE INDEX idx_quizzes_course ON course_quizzes(course_id);

-- Quiz question indexes
CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);

-- Quiz attempt indexes
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_user ON quiz_attempts(user_id);

-- ===========================================
-- JSONB GIN indexes for JSON query performance
-- ===========================================

-- Payments meta_json index
CREATE INDEX idx_payments_meta_json ON payments USING GIN (meta_json);

-- Quiz questions options_json index
CREATE INDEX idx_quiz_questions_options_json ON quiz_questions USING GIN (options_json);

-- Quiz attempts answers_json index
CREATE INDEX idx_quiz_attempts_answers_json ON quiz_attempts USING GIN (answers_json);

-- ===========================================
-- Migration Summary
-- ===========================================

/*
MySQL to PostgreSQL Conversion Summary:
1. AUTO_INCREMENT → SERIAL/BIGSERIAL: 8 columns converted
2. ENUM → VARCHAR + CHECK: 7 columns converted
3. TINYINT(1) → BOOLEAN: 3 columns converted  
4. JSON → JSONB: 3 columns converted
5. LONGTEXT → TEXT: 1 column converted
6. ON UPDATE CURRENT_TIMESTAMP → Triggers: 6 tables updated
7. UNIQUE KEY → UNIQUE constraint: 2 constraints converted
8. Removed MySQL-specific syntax: ENGINE, CHARSET, etc.

Total tables created: 8
Total triggers created: 6
Total indexes created: 24 + 3 GIN indexes
*/

-- End of PostgreSQL schema conversion script