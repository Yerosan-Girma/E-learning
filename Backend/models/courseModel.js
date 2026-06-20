const { pool } = require("../config/db");

const COURSE_SELECT = `
  SELECT
    c.*,
    u.full_name AS instructor_name,
    u.email AS instructor_email,
    (
      SELECT COUNT(*)
      FROM course_lessons l
      WHERE l.course_id = c.id
    ) AS lesson_count,
    (
      SELECT COUNT(*)
      FROM course_quizzes q
      WHERE q.course_id = c.id
    ) AS quiz_count,
    (
      SELECT COUNT(*)
      FROM enrollments e
      WHERE e.course_id = c.id AND e.status = 'approved'
    ) AS enrolled_students,
    (
      SELECT COALESCE(SUM(p.amount), 0)
      FROM payments p
      WHERE p.course_id = c.id AND p.status = 'completed'
    ) AS revenue_total
  FROM courses c
  INNER JOIN users u ON c.instructor_id = u.id
`;

async function createCourse({
  title,
  subtitle,
  description,
  category,
  level,
  price,
  discountPrice,
  thumbnailUrl,
  instructorId,
  learningOutcomes,
  prerequisites,
  syllabus,
  tags,
  language,
  duration,
  featured,
}) {
  const result = await pool.query(
    `
      INSERT INTO courses
        (title, subtitle, description, category, level, price, discount_price, thumbnail_url, instructor_id, 
         learning_outcomes, prerequisites, syllabus, tags, language, duration, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `,
    [
      title,
      subtitle,
      description,
      category,
      level,
      price,
      discountPrice,
      thumbnailUrl,
      instructorId,
      learningOutcomes,
      prerequisites,
      syllabus,
      tags,
      language,
      duration,
      featured,
    ]
  );

  return result.rows[0].id;
}

async function updateCourseById(courseId, payload) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${paramIndex++}`);
    values.push(value);
  });

  if (fields.length === 0) return 0;

  values.push(courseId);

  const result = await pool.query(
    `UPDATE courses SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  return result.rowCount;
}

async function getCourseById(courseId, { includeUnpublished = true } = {}) {
  const result = await pool.query(
    `
      ${COURSE_SELECT}
      WHERE c.id = $1
      ${includeUnpublished ? "" : "AND c.is_published = TRUE"}
      LIMIT 1
    `,
    [courseId]
  );

  return result.rows[0] || null;
}

async function listCourses({
  category,
  search,
  instructorId,
  includeUnpublished = false,
  level,
  language,
  featured = null,
  minPrice = null,
  maxPrice = null,
  sortBy = 'created_at',
  sortOrder = 'DESC',
} = {}) {
  let query = `${COURSE_SELECT} WHERE 1 = 1`;
  const values = [];
  let paramIndex = 1;

  if (!includeUnpublished) {
    query += " AND c.is_published = TRUE";
  }

  if (category) {
    query += ` AND c.category = $${paramIndex++}`;
    values.push(category);
  }

  if (instructorId) {
    query += ` AND c.instructor_id = $${paramIndex++}`;
    values.push(instructorId);
  }

  if (level) {
    query += ` AND c.level = $${paramIndex++}`;
    values.push(level);
  }

  if (language) {
    query += ` AND c.language = $${paramIndex++}`;
    values.push(language);
  }

  if (featured !== null) {
    query += ` AND c.featured = $${paramIndex++}`;
    values.push(featured);
  }

  if (minPrice !== null) {
    query += ` AND c.price >= $${paramIndex++}`;
    values.push(minPrice);
  }

  if (maxPrice !== null) {
    query += ` AND c.price <= $${paramIndex++}`;
    values.push(maxPrice);
  }

  if (search) {
    query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex + 1} OR c.category ILIKE $${paramIndex + 2} OR c.tags ILIKE $${paramIndex + 3})`;
    const term = `%${search}%`;
    values.push(term, term, term, term);
    paramIndex += 4;
  }

  // Validate sort column
  const validSortColumns = ['created_at', 'title', 'price', 'rating', 'total_students'];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

  query += ` ORDER BY c.${sortColumn} ${validSortOrder}`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function listCoursesByInstructor(instructorId) {
  return listCourses({
    instructorId,
    includeUnpublished: true,
  });
}

async function getFeaturedCourses(limit = 6) {
  const query = `
    ${COURSE_SELECT}
    WHERE c.is_published = TRUE AND c.featured = TRUE
    ORDER BY c.rating DESC, c.total_students DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

async function getFreeCourses(limit = 10) {
  const query = `
    ${COURSE_SELECT}
    WHERE c.is_published = TRUE AND c.price = 0
    ORDER BY c.rating DESC, c.total_students DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

async function getPaidCourses(limit = 10) {
  const query = `
    ${COURSE_SELECT}
    WHERE c.is_published = TRUE AND c.price > 0
    ORDER BY c.rating DESC, c.total_students DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

async function updateCourseStats(courseId) {
  const query = `
    UPDATE courses
    SET 
      total_students = (
        SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = 'approved'
      ),
      rating = COALESCE((
        SELECT AVG(rating) FROM reviews WHERE course_id = $1
      ), 0)
    WHERE id = $1
  `;
  const result = await pool.query(query, [courseId]);
  return result.rowCount;
}

module.exports = {
  createCourse,
  updateCourseById,
  getCourseById,
  listCourses,
  listCoursesByInstructor,
  getFeaturedCourses,
  getFreeCourses,
  getPaidCourses,
  updateCourseStats,
};
