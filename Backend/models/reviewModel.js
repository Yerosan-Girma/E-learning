const { pool } = require("../config/db");

async function createReview({ userId, courseId, rating, comment }) {
  const query = `
    INSERT INTO reviews (user_id, course_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [userId, courseId, rating, comment]);
  return result.rows[0].id;
}

async function getReviewsByCourse(courseId) {
  const query = `
    SELECT r.*, u.full_name AS reviewer_name, u.email AS reviewer_email
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.course_id = $1
    ORDER BY r.created_at DESC
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

async function getReviewById(id) {
  const query = "SELECT * FROM reviews WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function getReviewByUserAndCourse(userId, courseId) {
  const query = `
    SELECT * FROM reviews
    WHERE user_id = $1 AND course_id = $2
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, courseId]);
  return result.rows[0] || null;
}

async function updateReview(id, { rating, comment }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (rating !== undefined) {
    fields.push(`rating = $${paramIndex++}`);
    values.push(rating);
  }
  if (comment !== undefined) {
    fields.push(`comment = $${paramIndex++}`);
    values.push(comment);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE reviews SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteReview(id) {
  const result = await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
  return result.rowCount;
}

async function getAverageRating(courseId) {
  const query = `
    SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews
    FROM reviews
    WHERE course_id = $1
  `;
  const result = await pool.query(query, [courseId]);
  return {
    averageRating: parseFloat(result.rows[0].average_rating),
    totalReviews: parseInt(result.rows[0].total_reviews),
  };
}

async function updateCourseRating(courseId) {
  const { averageRating, totalReviews } = await getAverageRating(courseId);
  const query = `
    UPDATE courses
    SET rating = $1, total_students = (
      SELECT COUNT(*) FROM enrollments WHERE course_id = $2 AND status = 'approved'
    )
    WHERE id = $2
  `;
  const result = await pool.query(query, [averageRating, courseId]);
  return result.rowCount;
}

module.exports = {
  createReview,
  getReviewsByCourse,
  getReviewById,
  getReviewByUserAndCourse,
  updateReview,
  deleteReview,
  getAverageRating,
  updateCourseRating,
};
