const { pool } = require("../config/db");

async function getTeacherDashboardSummary(teacherId) {
  const courseResult = await pool.query(
    "SELECT COUNT(*) AS total FROM courses WHERE instructor_id = $1",
    [teacherId]
  );

  const lessonResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM course_lessons l
      INNER JOIN courses c ON l.course_id = c.id
      WHERE c.instructor_id = $1
    `,
    [teacherId]
  );

  const studentResult = await pool.query(
    `
      SELECT COUNT(DISTINCT e.user_id) AS total
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = $1 AND e.status = 'approved'
    `,
    [teacherId]
  );

  const enrollmentResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = $1
    `,
    [teacherId]
  );

  const revenueResult = await pool.query(
    `
      SELECT COALESCE(SUM(p.amount), 0) AS total
      FROM payments p
      INNER JOIN courses c ON p.course_id = c.id
      WHERE c.instructor_id = $1 AND p.status = 'completed'
    `,
    [teacherId]
  );

  const quizResult = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM course_quizzes q
      INNER JOIN courses c ON q.course_id = c.id
      WHERE c.instructor_id = $1
    `,
    [teacherId]
  );

  return {
    totalCourses: Number(courseResult.rows[0]?.total || 0),
    totalLessons: Number(lessonResult.rows[0]?.total || 0),
    totalStudents: Number(studentResult.rows[0]?.total || 0),
    totalEnrollments: Number(enrollmentResult.rows[0]?.total || 0),
    totalRevenue: Number(revenueResult.rows[0]?.total || 0),
    totalQuizzes: Number(quizResult.rows[0]?.total || 0),
  };
}

async function getStudentDashboardSummary(studentId) {
  const enrollmentResult = await pool.query(
    "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = $1",
    [studentId]
  );

  const approvedResult = await pool.query(
    "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = $1 AND status = 'approved'",
    [studentId]
  );

  const completedLessonsResult = await pool.query(
    "SELECT COUNT(*) AS total FROM lesson_views WHERE user_id = $1 AND completed = TRUE",
    [studentId]
  );

  const paymentResult = await pool.query(
    `
      SELECT
        COUNT(*) AS totalPayments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS totalSpent
      FROM payments
      WHERE user_id = $1
    `,
    [studentId]
  );

  const quizResult = await pool.query(
    `
      SELECT
        COUNT(*) AS totalAttempts,
        COALESCE(AVG(score), 0) AS averageScore
      FROM quiz_attempts
      WHERE user_id = $1
    `,
    [studentId]
  );

  return {
    totalEnrollments: Number(enrollmentResult.rows[0]?.total || 0),
    approvedEnrollments: Number(approvedResult.rows[0]?.total || 0),
    completedLessons: Number(completedLessonsResult.rows[0]?.total || 0),
    totalPayments: Number(paymentResult.rows[0]?.totalPayments || 0),
    totalSpent: Number(paymentResult.rows[0]?.totalSpent || 0),
    totalQuizAttempts: Number(quizResult.rows[0]?.totalAttempts || 0),
    averageQuizScore: Number(quizResult.rows[0]?.averageScore || 0),
  };
}

async function getAdminDashboardSummary() {
  const userResult = await pool.query("SELECT role, COUNT(*) AS total FROM users GROUP BY role");
  const courseResult = await pool.query("SELECT COUNT(*) AS total FROM courses");
  const enrollmentResult = await pool.query("SELECT COUNT(*) AS total FROM enrollments");
  const paymentResult = await pool.query("SELECT status, COUNT(*) AS total FROM payments GROUP BY status");
  const revenueResult = await pool.query(
    "SELECT COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) AS total FROM payments"
  );
  const quizResult = await pool.query("SELECT COUNT(*) AS total FROM course_quizzes");

  return {
    usersByRole: userResult.rows,
    totalCourses: Number(courseResult.rows[0]?.total || 0),
    totalEnrollments: Number(enrollmentResult.rows[0]?.total || 0),
    totalRevenue: Number(revenueResult.rows[0]?.total || 0),
    totalQuizzes: Number(quizResult.rows[0]?.total || 0),
    paymentsByStatus: paymentResult.rows,
  };
}

module.exports = {
  getTeacherDashboardSummary,
  getStudentDashboardSummary,
  getAdminDashboardSummary,
};
