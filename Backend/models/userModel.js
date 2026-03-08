const { pool } = require("../config/db");

async function createUser({ fullName, email, passwordHash, role }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await pool.execute(query, [fullName, email, passwordHash, role]);
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    "SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  return rows[0] || null;
}

async function listUsersByRole(role) {
  const [rows] = await pool.execute(
    "SELECT id, full_name, email, role, status, created_at FROM users WHERE role = ? ORDER BY created_at DESC",
    [role]
  );

  return rows;
}

async function countUsersByRole() {
  const [rows] = await pool.execute(`
    SELECT role, COUNT(*) AS total
    FROM users
    GROUP BY role
  `);

  return rows;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsersByRole,
  countUsersByRole,
};
