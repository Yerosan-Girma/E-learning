const { pool } = require("../config/db");

async function createModule({ courseId, title, description, sortOrder }) {
  const query = `
    INSERT INTO modules (course_id, title, description, sort_order)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [courseId, title, description, sortOrder]);
  return result.rows[0].id;
}

async function getModulesByCourse(courseId) {
  const query = `
    SELECT * FROM modules
    WHERE course_id = $1
    ORDER BY sort_order ASC
  `;
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

async function getModuleById(id) {
  const query = "SELECT * FROM modules WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateModule(id, { title, description, sortOrder }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (sortOrder !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    values.push(sortOrder);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE modules SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteModule(id) {
  const result = await pool.query("DELETE FROM modules WHERE id = $1", [id]);
  return result.rowCount;
}

async function deleteModulesByCourse(courseId) {
  const result = await pool.query("DELETE FROM modules WHERE course_id = $1", [courseId]);
  return result.rowCount;
}

module.exports = {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
  deleteModulesByCourse,
};
