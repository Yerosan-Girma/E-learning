-- Enhanced PostgreSQL Schema for E-Learning Platform
-- Based on Software Design Document Requirements
-- This migration adds missing entities and fields to align with SDD

-- ===========================================
-- Add new columns to courses table
-- ===========================================

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(200),
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT,
ADD COLUMN IF NOT EXISTS syllabus TEXT,
ADD COLUMN IF NOT EXISTS tags VARCHAR(500),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English',
ADD COLUMN IF NOT EXISTS duration VARCHAR(50),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN courses.subtitle IS 'Course subtitle for marketing';
COMMENT ON COLUMN courses.learning_outcomes IS 'JSON array of learning outcomes';
COMMENT ON COLUMN courses.prerequisites IS 'Course prerequisites and requirements';
COMMENT ON COLUMN courses.syllabus IS 'Detailed course syllabus';
COMMENT ON COLUMN courses.tags IS 'Comma-separated course tags';
COMMENT ON COLUMN courses.rating IS 'Average course rating (0-5)';
COMMENT ON COLUMN courses.total_students IS 'Total enrolled students count';
COMMENT ON COLUMN courses.language IS 'Course language';
COMMENT ON COLUMN courses.duration IS 'Course duration (e.g., 10 hours)';
COMMENT ON COLUMN courses.featured IS 'Featured course flag for homepage';

-- ===========================================
-- Update payment gateway enum to include new gateways
-- ===========================================

ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_gateway_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_gateway_check 
CHECK (gateway IN ('telebirr', 'bank_transfer', 'cash', 'chapa', 'paypal', 'cbe_birr'));

COMMENT ON COLUMN payments.gateway IS 'Payment gateway: telebirr, bank_transfer, cash, chapa, paypal, cbe_birr';

-- ===========================================
-- Create categories table
-- ===========================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS 'Course categories for organization';

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_categories_active ON categories(is_active);

-- ===========================================
-- Create modules table
-- ===========================================

CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_modules_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE modules IS 'Course modules for organizing lessons';

CREATE TRIGGER update_modules_updated_at 
  BEFORE UPDATE ON modules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_modules_sort ON modules(course_id, sort_order);

-- ===========================================
-- Update course_lessons to reference modules
-- ===========================================

ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS module_id INTEGER;

ALTER TABLE course_lessons 
ADD CONSTRAINT fk_lessons_module 
  FOREIGN KEY (module_id) 
  REFERENCES modules(id) 
  ON DELETE SET NULL;

CREATE INDEX idx_lessons_module ON course_lessons(module_id);

-- ===========================================
-- Create resources table
-- ===========================================

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER,
  course_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'pdf', 'video', 'document', 'link', 'assignment'
  file_url VARCHAR(500),
  file_size INTEGER,
  description TEXT,
  is_downloadable BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resources_lesson 
    FOREIGN KEY (lesson_id) 
    REFERENCES course_lessons(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_resources_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE resources IS 'Additional resources for lessons (PDFs, videos, assignments)';

CREATE TRIGGER update_resources_updated_at 
  BEFORE UPDATE ON resources 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_resources_lesson ON resources(lesson_id);
CREATE INDEX idx_resources_course ON resources(course_id);
CREATE INDEX idx_resources_type ON resources(resource_type);

-- ===========================================
-- Create certificates table
-- ===========================================

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pdf_url VARCHAR(500),
  CONSTRAINT fk_certificates_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_certificates_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE certificates IS 'Course completion certificates';

CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);

-- ===========================================
-- Create notifications table
-- ===========================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'enrollment', 'payment', 'course_approved', 'quiz_graded', 'certificate', etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS 'User notifications';

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ===========================================
-- Create bookmarks table
-- ===========================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  note TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_user_lesson_bookmark UNIQUE (user_id, lesson_id),
  CONSTRAINT fk_bookmarks_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_lesson 
    FOREIGN KEY (lesson_id) 
    REFERENCES course_lessons(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE bookmarks IS 'User lesson bookmarks';

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_course ON bookmarks(course_id);

-- ===========================================
-- Create course_discussions table
-- ===========================================

CREATE TABLE IF NOT EXISTS course_discussions (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  lesson_id INTEGER,
  user_id INTEGER NOT NULL,
  parent_id BIGINT, -- For nested replies
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_answer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_discussions_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_discussions_lesson 
    FOREIGN KEY (lesson_id) 
    REFERENCES course_lessons(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_discussions_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_discussions_parent 
    FOREIGN KEY (parent_id) 
    REFERENCES course_discussions(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE course_discussions IS 'Course discussion forums';

CREATE TRIGGER update_discussions_updated_at 
  BEFORE UPDATE ON course_discussions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_discussions_course ON course_discussions(course_id);
CREATE INDEX idx_discussions_lesson ON course_discussions(lesson_id);
CREATE INDEX idx_discussions_user ON course_discussions(user_id);
CREATE INDEX idx_discussions_parent ON course_discussions(parent_id);

-- ===========================================
-- Create announcements table
-- ===========================================

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  instructor_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_announcements_instructor 
    FOREIGN KEY (instructor_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE announcements IS 'Course announcements from instructors';

CREATE TRIGGER update_announcements_updated_at 
  BEFORE UPDATE ON announcements 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_announcements_course ON announcements(course_id);
CREATE INDEX idx_announcements_pinned ON announcements(course_id, is_pinned);

-- ===========================================
-- Create subscriptions table
-- ===========================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
  amount DECIMAL(10,2) NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_subscriptions_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE subscriptions IS 'User premium subscriptions';

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);

-- ===========================================
-- Create reviews table
-- ===========================================

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uniq_user_course_review UNIQUE (user_id, course_id),
  CONSTRAINT fk_reviews_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_course 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE CASCADE
);

COMMENT ON TABLE reviews IS 'Course reviews and ratings';

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ===========================================
-- Update enrollments table with additional fields
-- ===========================================

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS enrollment_type VARCHAR(20) DEFAULT 'purchase', -- 'purchase', 'subscription'
ADD COLUMN IF NOT EXISTS payment_id BIGINT;

ALTER TABLE enrollments 
ADD CONSTRAINT fk_enrollments_payment 
  FOREIGN KEY (payment_id) 
  REFERENCES payments(id) 
  ON DELETE SET NULL;

COMMENT ON COLUMN enrollments.enrollment_type IS 'Type of enrollment: purchase or subscription';
COMMENT ON COLUMN enrollments.payment_id IS 'Reference to payment transaction';

-- ===========================================
-- Migration Summary
-- ===========================================

/*
Enhanced Schema Changes:
1. Added 10 new columns to courses table
2. Updated payment gateway enum to include 3 new gateways (chapa, paypal, cbe_birr)
3. Created 9 new tables: categories, modules, resources, certificates, notifications, bookmarks, course_discussions, announcements, subscriptions, reviews
4. Updated course_lessons to reference modules
5. Added 2 new columns to enrollments table
6. Created appropriate foreign keys, indexes, and triggers

Total new tables: 10
Total new columns: 12
Total new indexes: 25+
Total new triggers: 5
*/
