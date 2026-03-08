const { pool } = require("../config/db");

async function getTeacherDashboardSummary(teacherId) {
  const [courseRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM courses WHERE instructor_id = ?",
    [teacherId]
  );

  const [lessonRows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM course_lessons l
      INNER JOIN courses c ON l.course_id = c.id
      WHERE c.instructor_id = ?
    `,
    [teacherId]
  );

  const [studentRows] = await pool.execute(
    `
      SELECT COUNT(DISTINCT e.user_id) AS total
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = ? AND e.status = 'approved'
    `,
    [teacherId]
  );

  return {
    totalCourses: Number(courseRows[0]?.total || 0),
    totalLessons: Number(lessonRows[0]?.total || 0),
    totalStudents: Number(studentRows[0]?.total || 0),
  };
}

async function getStudentDashboardSummary(studentId) {
  const [enrollmentRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = ?",
    [studentId]
  );

  const [approvedRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM enrollments WHERE user_id = ? AND status = 'approved'",
    [studentId]
  );

  const [completedLessonsRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM lesson_views WHERE user_id = ? AND completed = 1",
    [studentId]
  );

  return {
    totalEnrollments: Number(enrollmentRows[0]?.total || 0),
    approvedEnrollments: Number(approvedRows[0]?.total || 0),
    completedLessons: Number(completedLessonsRows[0]?.total || 0),
  };
}

async function getAdminDashboardSummary() {
  const [userRows] = await pool.execute("SELECT role, COUNT(*) AS total FROM users GROUP BY role");
  const [courseRows] = await pool.execute("SELECT COUNT(*) AS total FROM courses");
  const [paymentRows] = await pool.execute("SELECT status, COUNT(*) AS total FROM payments GROUP BY status");

  return {
    usersByRole: userRows,
    totalCourses: Number(courseRows[0]?.total || 0),
    paymentsByStatus: paymentRows,
  };
}

module.exports = {
  getTeacherDashboardSummary,
  getStudentDashboardSummary,
  getAdminDashboardSummary,
};
