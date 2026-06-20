# EduLearn Backend (Node.js + Express + MySQL)

## Quick Start

1. Copy `.env.example` to `.env` and fill DB/JWT values.
2. Run SQL in `database/schema.sql`.
3. (Optional) Load demo data from `database/seed-demo.sql`.
4. Install dependencies:
   - `cd Backend`
   - `npm install`
5. Start server:
   - `npm run dev`

Base URL: `http://localhost:5000/api`

## Main Endpoints

- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- Courses: `/courses`, `/courses/:courseId`
- Lessons: `/courses/:courseId/lessons`, `/lessons/:lessonId`
- Enrollments: `/enrollments/:courseId`, `/enrollments/me/list`
- Payments: `/payments/courses/:courseId/initialize`, `/payments/courses/:courseId/manual-proof`
- Quizzes: `/courses/:courseId/quizzes`, `/quizzes/:quizId`, `/quizzes/:quizId/attempts`
- Dashboards: `/dashboard/student`, `/dashboard/teacher`, `/dashboard/admin`
- Users: `/users`, `/users/:userId/status`

## Supported Platform Flow

- Students can self-register and enroll in free courses instantly.
- Premium courses require a simulated payment using Telebirr, Bank Transfer, or Cash.
- Completed simulated payments generate a transaction ID and activate enrollment immediately.
- Lessons and quizzes are protected so premium content is only available to authorized learners.
- Instructors can create courses, lessons, quizzes, and quiz questions.
- Admins can review users, courses, payments, and enrollments in one dashboard.

## Demo Accounts

- Student: `student@edulearn.com` / `Student@123`
- Teacher: `teacher@edulearn.com` / `Teacher@123`
- Admin: `admin@edulearn.com` / `Admin@123`
