const { pool } = require("../config/db");

async function createCategory({ name, description, iconUrl, sortOrder }) {
  const query = `
    INSERT INTO categories (name, description, icon_url, sort_order)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [name, description, iconUrl, sortOrder]);
  return result.rows[0].id;
}

async function getAllCategories() {
  const query = `
    SELECT * FROM categories
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, name ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getCategoryById(id) {
  const query = "SELECT * FROM categories WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function updateCategory(id, { name, description, iconUrl, sortOrder, isActive }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (iconUrl !== undefined) {
    fields.push(`icon_url = $${paramIndex++}`);
    values.push(iconUrl);
  }
  if (sortOrder !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    values.push(sortOrder);
  }
  if (isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE categories SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function deleteCategory(id) {
  const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  return result.rowCount;
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
