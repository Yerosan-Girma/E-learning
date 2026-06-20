const { pool } = require("../config/db");

async function createPayment({
  userId,
  courseId,
  amount,
  gateway,
  transactionId,
  status,
  screenshotPath,
  metaJson,
}) {
  const result = await pool.query(
    `
      INSERT INTO payments
      (user_id, course_id, amount, gateway, transaction_id, status, screenshot_path, meta_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [
      userId,
      courseId,
      amount,
      gateway,
      transactionId,
      status,
      screenshotPath,
      metaJson ? JSON.stringify(metaJson) : null,
    ]
  );

  return result.rows[0].id;
}

async function updatePaymentStatus({ paymentId, status, transactionId }) {
  const result = await pool.query(
    `
      UPDATE payments
      SET status = $1, transaction_id = COALESCE($2, transaction_id)
      WHERE id = $3
    `,
    [status, transactionId || null, paymentId]
  );

  return result.rowCount;
}

async function findPaymentById(paymentId) {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE id = $1
      LIMIT 1
    `,
    [paymentId]
  );

  return result.rows[0] || null;
}

async function findPaymentByTransaction(transactionId) {
  const result = await pool.query(
    "SELECT * FROM payments WHERE transaction_id = $1 LIMIT 1",
    [transactionId]
  );

  return result.rows[0] || null;
}

async function findLatestPaymentByUserAndCourse({ userId, courseId }) {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE user_id = $1 AND course_id = $2
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    [userId, courseId]
  );

  return result.rows[0] || null;
}

async function findCompletedPaymentByUserAndCourse({ userId, courseId }) {
  const result = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE user_id = $1 AND course_id = $2 AND status = 'completed'
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    [userId, courseId]
  );

  return result.rows[0] || null;
}

async function listPayments({ userId = null, courseId = null, status = null, gateway = null } = {}) {
  let query = `
    SELECT p.*, c.title AS course_title, u.full_name AS user_name, u.email
    FROM payments p
    INNER JOIN courses c ON p.course_id = c.id
    INNER JOIN users u ON p.user_id = u.id
  `;

  const values = [];
  const clauses = [];
  let paramIndex = 1;

  if (userId) {
    clauses.push(`p.user_id = $${paramIndex++}`);
    values.push(userId);
  }

  if (courseId) {
    clauses.push(`p.course_id = $${paramIndex++}`);
    values.push(courseId);
  }

  if (status) {
    clauses.push(`p.status = $${paramIndex++}`);
    values.push(status);
  }

  if (gateway) {
    clauses.push(`p.gateway = $${paramIndex++}`);
    values.push(gateway);
  }

  if (clauses.length) {
    query += ` WHERE ${clauses.join(" AND ")}`;
  }

  query += " ORDER BY p.created_at DESC";

  const result = await pool.query(query, values);
  return result.rows;
}

async function countPaymentSummary() {
  const result = await pool.query(
    `
      SELECT status, COUNT(*) AS total
      FROM payments
      GROUP BY status
    `
  );

  return result.rows;
}

module.exports = {
  createPayment,
  updatePaymentStatus,
  findPaymentById,
  findPaymentByTransaction,
  findLatestPaymentByUserAndCourse,
  findCompletedPaymentByUserAndCourse,
  listPayments,
  countPaymentSummary,
};
