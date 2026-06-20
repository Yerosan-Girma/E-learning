const { pool } = require("../config/db");

async function createUser({ fullName, email, passwordHash, role }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const result = await pool.query(query, [fullName, email, passwordHash, role]);
  return result.rows[0].id;
}

async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, status, created_at FROM users WHERE id = $1 LIMIT 1",
    [id]
  );

  return result.rows[0] || null;
}

async function listUsersByRole(role) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, status, created_at FROM users WHERE role = $1 ORDER BY created_at DESC",
    [role]
  );

  return result.rows;
}

async function listUsers({ role = null, search = "" } = {}) {
  let query = `
    SELECT id, full_name, email, role, status, created_at
    FROM users
    WHERE 1 = 1
  `;
  const values = [];
  let paramIndex = 1;

  if (role) {
    query += ` AND role = $${paramIndex++}`;
    values.push(role);
  }

  if (search) {
    query += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1})`;
    const term = `%${search}%`;
    values.push(term, term);
    paramIndex += 2;
  }

  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, values);
  return result.rows;
}

async function updateUserStatus({ userId, status }) {
  const result = await pool.query(
    `
      UPDATE users
      SET status = $1
      WHERE id = $2
    `,
    [status, userId]
  );

  return result.rowCount;
}

async function countUsersByRole() {
  const result = await pool.query(`
    SELECT role, COUNT(*) AS total
    FROM users
    GROUP BY role
  `);

  return result.rows;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsersByRole,
  listUsers,
  updateUserStatus,
  countUsersByRole,
};
