const { pool } = require("../config/db");

async function createAnnouncement({ courseId, instructorId, title, content, isPinned }) {
  const query = `
    INSERT INTO announcements (course_id, instructor_id, title, content, is_pinned)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const result = await pool.query(query, [courseId, instructorId, title, content, isPinned]);
  return result.rows[0].id;
}

async function getAnnouncementsByCourse(courseId) {
  const query = `
    SELECT a.*, u.full_name AS instructor_name, u.email AS instructor_email
    FROM announcements a
    INNER JOIN users u ON a.instructor_id = u.id
    WHERE a.course_id = $1
    ORDER BY a.is_pinned DESC, a.created_at DESC
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

async function getAnnouncementById(id) {
  const query = `
    SELECT a.*, u.full_name AS instructor_name, u.email AS instructor_email,
           c.title AS course_title
    FROM announcements a
    INNER JOIN users u ON a.instructor_id = u.id
    INNER JOIN courses c ON a.course_id = c.id
    WHERE a.id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateAnnouncement(id, { title, content, isPinned }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    values.push(content);
  }
  if (isPinned !== undefined) {
    fields.push(`is_pinned = $${paramIndex++}`);
    values.push(isPinned);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE announcements SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteAnnouncement(id) {
  const result = await pool.query("DELETE FROM announcements WHERE id = $1", [id]);
  return result.rowCount;
}

async function deleteAnnouncementsByCourse(courseId) {
  const result = await pool.query("DELETE FROM announcements WHERE course_id = $1", [courseId]);
  return result.rowCount;
}

module.exports = {
  createAnnouncement,
  getAnnouncementsByCourse,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  deleteAnnouncementsByCourse,
};
