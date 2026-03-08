const { pool } = require("../config/db");

async function createLesson({
  courseId,
  title,
  lessonType,
  videoUrl,
  notesContent,
  attachmentUrl,
  sortOrder,
  isPreview,
}) {
  const [result] = await pool.execute(
    `
      INSERT INTO course_lessons
      (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      courseId,
      title,
      lessonType,
      videoUrl,
      notesContent,
      attachmentUrl,
      sortOrder,
      isPreview ? 1 : 0,
    ]
  );

  return result.insertId;
}

async function listLessonsByCourseId(courseId) {
  const [rows] = await pool.execute(
    `
      SELECT id, course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview, created_at
      FROM course_lessons
      WHERE course_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [courseId]
  );

  return rows;
}

async function getLessonById(lessonId) {
  const [rows] = await pool.execute(
    `
      SELECT l.*, c.title AS course_title, c.instructor_id
      FROM course_lessons l
      INNER JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
      LIMIT 1
    `,
    [lessonId]
  );

  return rows[0] || null;
}

async function upsertLessonView({ userId, lessonId, completed }) {
  await pool.execute(
    `
      INSERT INTO lesson_views (user_id, lesson_id, completed, completed_at)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        completed = VALUES(completed),
        completed_at = VALUES(completed_at)
    `,
    [userId, lessonId, completed ? 1 : 0, completed ? new Date() : null]
  );
}

async function countCompletedLessonsByUserAndCourse({ userId, courseId }) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total
      FROM lesson_views lv
      INNER JOIN course_lessons l ON lv.lesson_id = l.id
      WHERE lv.user_id = ? AND l.course_id = ? AND lv.completed = 1
    `,
    [userId, courseId]
  );

  return Number(rows[0]?.total || 0);
}

module.exports = {
  createLesson,
  listLessonsByCourseId,
  getLessonById,
  upsertLessonView,
  countCompletedLessonsByUserAndCourse,
};
