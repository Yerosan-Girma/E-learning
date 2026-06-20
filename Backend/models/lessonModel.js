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
  const result = await pool.query(
    `
      INSERT INTO course_lessons
      (course_id, title, lesson_type, video_url, notes_content, attachment_url, sort_order, is_preview)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      courseId,
      title,
      lessonType,
      videoUrl,
      notesContent,
      attachmentUrl,
      sortOrder,
      isPreview ? true : false,
    ]
  );

  return result.rows[0].id;
}

async function listLessonsByCourseId(courseId) {
  const result = await pool.query(
    `
      SELECT id, course_id, title, lesson_type, video_url, notes_content, attachment_url, module_name, sort_order, is_preview, created_at
      FROM course_lessons
      WHERE course_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [courseId]
  );

  return result.rows;
}

async function getLessonById(lessonId) {
  const result = await pool.query(
    `
      SELECT l.*, c.title AS course_title, c.instructor_id
      FROM course_lessons l
      INNER JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
      LIMIT 1
    `,
    [lessonId]
  );

  return result.rows[0] || null;
}

async function upsertLessonView({ userId, lessonId, completed }) {
  await pool.query(
    `
      INSERT INTO lesson_views (user_id, lesson_id, completed, completed_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at
    `,
    [userId, lessonId, completed ? true : false, completed ? new Date() : null]
  );
}

async function countCompletedLessonsByUserAndCourse({ userId, courseId }) {
  const result = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM lesson_views lv
      INNER JOIN course_lessons l ON lv.lesson_id = l.id
      WHERE lv.user_id = $1 AND l.course_id = $2 AND lv.completed = TRUE
    `,
    [userId, courseId]
  );

  return Number(result.rows[0]?.total || 0);
}

async function listLessonProgressByUserAndCourse({ userId, courseId }) {
  const result = await pool.query(
    `
      SELECT
        lv.lesson_id,
        lv.completed,
        lv.completed_at
      FROM lesson_views lv
      INNER JOIN course_lessons l ON lv.lesson_id = l.id
      WHERE lv.user_id = $1 AND l.course_id = $2
    `,
    [userId, courseId]
  );

  return result.rows;
}

module.exports = {
  createLesson,
  listLessonsByCourseId,
  getLessonById,
  upsertLessonView,
  countCompletedLessonsByUserAndCourse,
  listLessonProgressByUserAndCourse,
};
