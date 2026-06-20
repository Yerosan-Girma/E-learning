const { pool } = require("../config/db");

async function createDiscussion({ courseId, lessonId, userId, subject, message, parentId }) {
  const query = `
    INSERT INTO course_discussions (course_id, lesson_id, user_id, parent_id, subject, message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `;
  const result = await pool.query(query, [courseId, lessonId, userId, parentId, subject, message]);
  return result.rows[0].id;
}

async function getDiscussionsByCourse(courseId, { lessonId = null, parentId = null } = {}) {
  let query = `
    SELECT d.*, u.full_name AS author_name, u.email AS author_email, u.role AS author_role,
           l.title AS lesson_title
    FROM course_discussions d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN course_lessons l ON d.lesson_id = l.id
    WHERE d.course_id = $1
  `;
  const values = [courseId];
  let paramIndex = 2;

  if (lessonId) {
    query += ` AND d.lesson_id = $${paramIndex++}`;
    values.push(lessonId);
  }

  if (parentId !== null) {
    if (parentId === null) {
      query += ` AND d.parent_id IS NULL`;
    } else {
      query += ` AND d.parent_id = $${paramIndex++}`;
      values.push(parentId);
    }
  }

  query += ` ORDER BY d.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getDiscussionById(id) {
  const query = `
    SELECT d.*, u.full_name AS author_name, u.email AS author_email, u.role AS author_role,
           l.title AS lesson_title, c.title AS course_title
    FROM course_discussions d
    INNER JOIN users u ON d.user_id = u.id
    LEFT JOIN course_lessons l ON d.lesson_id = l.id
    LEFT JOIN courses c ON d.course_id = c.id
    WHERE d.id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function getReplies(discussionId) {
  const query = `
    SELECT d.*, u.full_name AS author_name, u.email AS author_email, u.role AS author_role
    FROM course_discussions d
    INNER JOIN users u ON d.user_id = u.id
    WHERE d.parent_id = $1
    ORDER BY d.created_at ASC
  `;
  const result = await pool.query(query, [discussionId]);
  return result.rows;
}

async function updateDiscussion(id, { message, isAnswer }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (message !== undefined) {
    fields.push(`message = $${paramIndex++}`);
    values.push(message);
  }
  if (isAnswer !== undefined) {
    fields.push(`is_answer = $${paramIndex++}`);
    values.push(isAnswer);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE course_discussions SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteDiscussion(id) {
  const result = await pool.query("DELETE FROM course_discussions WHERE id = $1", [id]);
  return result.rowCount;
}

async function deleteDiscussionsByLesson(lessonId) {
  const result = await pool.query("DELETE FROM course_discussions WHERE lesson_id = $1", [lessonId]);
  return result.rowCount;
}

async function deleteDiscussionsByCourse(courseId) {
  const result = await pool.query("DELETE FROM course_discussions WHERE course_id = $1", [courseId]);
  return result.rowCount;
}

module.exports = {
  createDiscussion,
  getDiscussionsByCourse,
  getDiscussionById,
  getReplies,
  updateDiscussion,
  deleteDiscussion,
  deleteDiscussionsByLesson,
  deleteDiscussionsByCourse,
};
