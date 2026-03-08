const { pool } = require("../config/db");

async function findEnrollment({ userId, courseId }) {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM enrollments
      WHERE user_id = ? AND course_id = ?
      LIMIT 1
    `,
    [userId, courseId]
  );

  return rows[0] || null;
}

async function createEnrollment({ userId, courseId, status }) {
  const [result] = await pool.execute(
    `
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES (?, ?, ?)
    `,
    [userId, courseId, status]
  );

  return result.insertId;
}

async function updateEnrollment({ enrollmentId, status, progress, lastAccessed }) {
  const fields = [];
  const values = [];

  if (typeof status !== "undefined") {
    fields.push("status = ?");
    values.push(status);
  }

  if (typeof progress !== "undefined") {
    fields.push("progress = ?");
    values.push(progress);
  }

  if (typeof lastAccessed !== "undefined") {
    fields.push("last_accessed = ?");
    values.push(lastAccessed);
  }

  if (!fields.length) return 0;

  values.push(enrollmentId);

  const [result] = await pool.execute(
    `UPDATE enrollments SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
}

async function listEnrollmentsByUser(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        e.*,
        c.title AS course_title,
        c.category,
        c.thumbnail_url,
        c.price,
        c.discount_price,
        c.instructor_id,
        u.full_name AS instructor_name
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      INNER JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ?
      ORDER BY e.enrollment_date DESC
    `,
    [userId]
  );

  return rows;
}

async function listAllEnrollments({ status } = {}) {
  let query = `
    SELECT
      e.*,
      u.full_name AS student_name,
      u.email AS student_email,
      c.title AS course_title,
      c.category,
      t.full_name AS instructor_name
    FROM enrollments e
    INNER JOIN users u ON e.user_id = u.id
    INNER JOIN courses c ON e.course_id = c.id
    INNER JOIN users t ON c.instructor_id = t.id
  `;

  const values = [];

  if (status) {
    query += " WHERE e.status = ?";
    values.push(status);
  }

  query += " ORDER BY e.enrollment_date DESC";

  const [rows] = await pool.execute(query, values);
  return rows;
}

async function countEnrollmentSummary() {
  const [rows] = await pool.execute(
    `
      SELECT status, COUNT(*) AS total
      FROM enrollments
      GROUP BY status
    `
  );

  return rows;
}

module.exports = {
  findEnrollment,
  createEnrollment,
  updateEnrollment,
  listEnrollmentsByUser,
  listAllEnrollments,
  countEnrollmentSummary,
};
