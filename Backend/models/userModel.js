const { pool } = require("../config/db");

async function createUser({ fullName, email, passwordHash, role, status = "active", specialization = null, bio = null, proposedCourse = null, verificationToken = null }) {
  const query = `
    INSERT INTO users (full_name, email, password_hash, role, status, specialization, bio, proposed_course, verification_token)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  const result = await pool.query(query, [fullName, email, passwordHash, role, status, specialization, bio, proposedCourse, verificationToken]);
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

async function listPendingTeachers() {
  const result = await pool.query(`
    SELECT id, full_name, email, role, status, specialization, bio, proposed_course, created_at
    FROM users
    WHERE role = 'teacher' AND status = 'pending'
    ORDER BY created_at ASC
  `);

  return result.rows;
}

async function setVerificationToken(userId, token) {
  const result = await pool.query(
    "UPDATE users SET verification_token = $1 WHERE id = $2 RETURNING id",
    [token, userId]
  );
  return result.rowCount > 0;
}

async function findByVerificationToken(token) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, status, email_verified FROM users WHERE verification_token = $1 LIMIT 1",
    [token]
  );
  return result.rows[0] || null;
}

async function markEmailVerified(userId) {
  const result = await pool.query(
    "UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1 RETURNING id",
    [userId]
  );
  return result.rowCount > 0;
}

async function setResetToken(userId, token, expiresAt) {
  const result = await pool.query(
    "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3 RETURNING id",
    [token, expiresAt, userId]
  );
  return result.rowCount > 0;
}

async function findByResetToken(token) {
  const result = await pool.query(
    "SELECT id, full_name, email, role, status, reset_token_expires FROM users WHERE reset_token = $1 AND reset_token_expires > NOW() LIMIT 1",
    [token]
  );
  return result.rows[0] || null;
}

async function updatePassword(userId, passwordHash) {
  const result = await pool.query(
    "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2 RETURNING id",
    [passwordHash, userId]
  );
  return result.rowCount > 0;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsersByRole,
  listUsers,
  updateUserStatus,
  countUsersByRole,
  listPendingTeachers,
  setVerificationToken,
  findByVerificationToken,
  markEmailVerified,
  setResetToken,
  findByResetToken,
  updatePassword,
};
