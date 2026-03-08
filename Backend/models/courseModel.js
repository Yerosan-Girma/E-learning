const { pool } = require("../config/db");

async function createCourse({
  title,
  description,
  category,
  price,
  discountPrice,
  thumbnailUrl,
  instructorId,
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO courses
        (title, description, category, price, discount_price, thumbnail_url, instructor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [title, description, category, price, discountPrice, thumbnailUrl, instructorId]
  );

  return result.insertId;
}

async function updateCourseById(courseId, payload) {
  const fields = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  if (fields.length === 0) return 0;

  values.push(courseId);

  const [result] = await pool.execute(
    `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows;
}

async function getCourseById(courseId) {
  const [rows] = await pool.execute(
    `
      SELECT
        c.*,
        u.full_name AS instructor_name,
        u.email AS instructor_email
      FROM courses c
      INNER JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ?
      LIMIT 1
    `,
    [courseId]
  );

  return rows[0] || null;
}

async function listCourses({ category, search } = {}) {
  let query = `
    SELECT
      c.*,
      u.full_name AS instructor_name
    FROM courses c
    INNER JOIN users u ON c.instructor_id = u.id
    WHERE c.is_published = 1
  `;

  const values = [];

  if (category) {
    query += " AND c.category = ?";
    values.push(category);
  }

  if (search) {
    query += " AND (c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ?)";
    const term = `%${search}%`;
    values.push(term, term, term);
  }

  query += " ORDER BY c.created_at DESC";

  const [rows] = await pool.execute(query, values);
  return rows;
}

async function listCoursesByInstructor(instructorId) {
  const [rows] = await pool.execute(
    "SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC",
    [instructorId]
  );

  return rows;
}

module.exports = {
  createCourse,
  updateCourseById,
  getCourseById,
  listCourses,
  listCoursesByInstructor,
};
