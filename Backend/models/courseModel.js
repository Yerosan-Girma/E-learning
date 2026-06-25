const { pool } = require("../config/db");

const COURSE_SELECT = `
  SELECT
    c.*,
    u.full_name AS instructor_name,
    u.email AS instructor_email,
    COALESCE(lc.lesson_count, 0) AS lesson_count,
    COALESCE(qc.quiz_count, 0) AS quiz_count,
    COALESCE(ec.enrolled_students, 0) AS enrolled_students,
    COALESCE(rc.revenue_total, 0) AS revenue_total
  FROM courses c
  INNER JOIN users u ON c.instructor_id = u.id
  LEFT JOIN (
    SELECT course_id, COUNT(*) as lesson_count
    FROM course_lessons
    GROUP BY course_id
  ) lc ON c.id = lc.course_id
  LEFT JOIN (
    SELECT course_id, COUNT(*) as quiz_count
    FROM course_quizzes
    GROUP BY course_id
  ) qc ON c.id = qc.course_id
  LEFT JOIN (
    SELECT course_id, COUNT(*) as enrolled_students
    FROM enrollments
    WHERE status = 'approved'
    GROUP BY course_id
  ) ec ON c.id = ec.course_id
  LEFT JOIN (
    SELECT course_id, COALESCE(SUM(amount), 0) as revenue_total
    FROM payments
    WHERE status = 'completed'
    GROUP BY course_id
  ) rc ON c.id = rc.course_id
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
  page = 1,
  limit = 20,
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

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  
  // Get total count for pagination
  let countQuery = `SELECT COUNT(*) FROM courses c WHERE 1 = 1`;
  let countValues = [];
  let countParamIndex = 1;

  if (!includeUnpublished) {
    countQuery += " AND c.is_published = TRUE";
  }

  if (category) {
    countQuery += ` AND c.category = $${countParamIndex++}`;
    countValues.push(category);
  }

  if (instructorId) {
    countQuery += ` AND c.instructor_id = $${countParamIndex++}`;
    countValues.push(instructorId);
  }

  if (level) {
    countQuery += ` AND c.level = $${countParamIndex++}`;
    countValues.push(level);
  }

  if (language) {
    countQuery += ` AND c.language = $${countParamIndex++}`;
    countValues.push(language);
  }

  if (featured !== null) {
    countQuery += ` AND c.featured = $${countParamIndex++}`;
    countValues.push(featured);
  }

  if (minPrice !== null) {
    countQuery += ` AND c.price >= $${countParamIndex++}`;
    countValues.push(minPrice);
  }

  if (maxPrice !== null) {
    countQuery += ` AND c.price <= $${countParamIndex++}`;
    countValues.push(maxPrice);
  }

  if (search) {
    countQuery += ` AND (c.title ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex + 1} OR c.category ILIKE $${countParamIndex + 2} OR c.tags ILIKE $${countParamIndex + 3})`;
    const term = `%${search}%`;
    countValues.push(term, term, term, term);
  }

  const countResult = await pool.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);

  return {
    courses: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
