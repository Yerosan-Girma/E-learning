const { pool } = require("../config/db");

async function createResource({
  lessonId,
  courseId,
  title,
  resourceType,
  fileUrl,
  fileSize,
  description,
  isDownloadable,
  sortOrder,
}) {
  const query = `
    INSERT INTO resources (lesson_id, course_id, title, resource_type, file_url, file_size, description, is_downloadable, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;
  const result = await pool.query(query, [
    lessonId,
    courseId,
    title,
    resourceType,
    fileUrl,
    fileSize,
    description,
    isDownloadable,
    sortOrder,
  ]);
  return result.rows[0].id;
}

async function getResourcesByLesson(lessonId) {
  const query = `
    SELECT * FROM resources
    WHERE lesson_id = $1
    ORDER BY sort_order ASC
  `;
  const result = await pool.query(query, [lessonId]);
  return result.rows;
}

async function getResourcesByCourse(courseId) {
  const query = `
    SELECT * FROM resources
    WHERE course_id = $1
    ORDER BY sort_order ASC
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

async function getResourceById(id) {
  const query = "SELECT * FROM resources WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateResource(id, { title, resourceType, fileUrl, fileSize, description, isDownloadable, sortOrder }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (resourceType !== undefined) {
    fields.push(`resource_type = $${paramIndex++}`);
    values.push(resourceType);
  }
  if (fileUrl !== undefined) {
    fields.push(`file_url = $${paramIndex++}`);
    values.push(fileUrl);
  }
  if (fileSize !== undefined) {
    fields.push(`file_size = $${paramIndex++}`);
    values.push(fileSize);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (isDownloadable !== undefined) {
    fields.push(`is_downloadable = $${paramIndex++}`);
    values.push(isDownloadable);
  }
  if (sortOrder !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    values.push(sortOrder);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE resources SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteResource(id) {
  const result = await pool.query("DELETE FROM resources WHERE id = $1", [id]);
  return result.rowCount;
}

async function deleteResourcesByLesson(lessonId) {
  const result = await pool.query("DELETE FROM resources WHERE lesson_id = $1", [lessonId]);
  return result.rowCount;
}

module.exports = {
  createResource,
  getResourcesByLesson,
  getResourcesByCourse,
  getResourceById,
  updateResource,
  deleteResource,
  deleteResourcesByLesson,
};
