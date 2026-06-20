const { pool } = require("../config/db");

async function createBookmark({ userId, lessonId, courseId, note }) {
  const query = `
    INSERT INTO bookmarks (user_id, lesson_id, course_id, note)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET note = EXCLUDED.note, timestamp = CURRENT_TIMESTAMP
    RETURNING id
  `;
  const result = await pool.query(query, [userId, lessonId, courseId, note]);
  return result.rows[0].id;
}

async function getBookmarksByUser(userId) {
  const query = `
    SELECT b.*, l.title AS lesson_title, l.video_url, l.module_name,
           c.title AS course_title, c.thumbnail_url
    FROM bookmarks b
    INNER JOIN course_lessons l ON b.lesson_id = l.id
    INNER JOIN courses c ON b.course_id = c.id
    WHERE b.user_id = $1
    ORDER BY b.timestamp DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function getBookmarksByCourse(userId, courseId) {
  const query = `
    SELECT b.*, l.title AS lesson_title, l.video_url, l.module_name
    FROM bookmarks b
    INNER JOIN course_lessons l ON b.lesson_id = l.id
    WHERE b.user_id = $1 AND b.course_id = $2
    ORDER BY b.timestamp DESC
  `;
  const result = await pool.query(query, [userId, courseId]);
  return result.rows;
}

async function getBookmarkByUserAndLesson(userId, lessonId) {
  const query = `
    SELECT * FROM bookmarks
    WHERE user_id = $1 AND lesson_id = $2
    LIMIT 1
  `;
  const result = await pool.query(query, [userId, lessonId]);
  return result.rows[0] || null;
}

async function updateBookmark(userId, lessonId, { note }) {
  const query = `
    UPDATE bookmarks
    SET note = $1, timestamp = CURRENT_TIMESTAMP
    WHERE user_id = $2 AND lesson_id = $3
  `;
  const result = await pool.query(query, [note, userId, lessonId]);
  return result.rowCount;
}

async function deleteBookmark(userId, lessonId) {
  const query = `
    DELETE FROM bookmarks
    WHERE user_id = $1 AND lesson_id = $2
  `;
  const result = await pool.query(query, [userId, lessonId]);
  return result.rowCount;
}

async function deleteBookmarksByCourse(userId, courseId) {
  const query = `
    DELETE FROM bookmarks
    WHERE user_id = $1 AND course_id = $2
  `;
  const result = await pool.query(query, [userId, courseId]);
  return result.rowCount;
}

module.exports = {
  createBookmark,
  getBookmarksByUser,
  getBookmarksByCourse,
  getBookmarkByUserAndLesson,
  updateBookmark,
  deleteBookmark,
  deleteBookmarksByCourse,
};
