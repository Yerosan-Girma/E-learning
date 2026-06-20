const { pool } = require("../config/db");

async function findEnrollment({ userId, courseId }) {
  const result = await pool.query(
    `
      SELECT *
      FROM enrollments
      WHERE user_id = $1 AND course_id = $2
      LIMIT 1
    `,
    [userId, courseId]
  );

  return result.rows[0] || null;
}

async function createEnrollment({ userId, courseId, status, enrollmentType }) {
  // Try with enrollment_type column first (for enhanced schema)
  try {
    const result = await pool.query(
      `
        INSERT INTO enrollments (user_id, course_id, status, enrollment_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
      [userId, courseId, status, enrollmentType || 'purchase']
    );
    return result.rows[0].id;
  } catch (error) {
    // If column doesn't exist, try without it (for original schema)
    if (error.code === '42703') { // column does not exist
      const result = await pool.query(
        `
          INSERT INTO enrollments (user_id, course_id, status)
          VALUES ($1, $2, $3)
          RETURNING id
        `,
        [userId, courseId, status]
      );
      return result.rows[0].id;
    }
    throw error;
  }
}

async function updateEnrollment({ enrollmentId, status, progress, lastAccessed }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (typeof status !== "undefined") {
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  if (typeof progress !== "undefined") {
    fields.push(`progress = $${paramIndex++}`);
    values.push(progress);
  }

  if (typeof lastAccessed !== "undefined") {
    fields.push(`last_accessed = $${paramIndex++}`);
    values.push(lastAccessed);
  }

  if (!fields.length) return 0;

  values.push(enrollmentId);

  const result = await pool.query(
    `UPDATE enrollments SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  return result.rowCount;
}

async function listEnrollmentsByUser(userId) {
  const result = await pool.query(
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
      WHERE e.user_id = $1
      ORDER BY e.enrollment_date DESC
    `,
    [userId]
  );

  return result.rows;
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
  let paramIndex = 1;

  if (status) {
    query += ` WHERE e.status = $${paramIndex++}`;
    values.push(status);
  }

  query += " ORDER BY e.enrollment_date DESC";

  const result = await pool.query(query, values);
  return result.rows;
}

async function countEnrollmentSummary() {
  const result = await pool.query(
    `
      SELECT status, COUNT(*) AS total
      FROM enrollments
      GROUP BY status
    `
  );

  return result.rows;
}

module.exports = {
  findEnrollment,
  createEnrollment,
  updateEnrollment,
  listEnrollmentsByUser,
  listAllEnrollments,
  countEnrollmentSummary,
};
