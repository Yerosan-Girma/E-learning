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
  const [result] = await pool.execute(
    `
      INSERT INTO payments
      (user_id, course_id, amount, gateway, transaction_id, status, screenshot_path, meta_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

  return result.insertId;
}

async function updatePaymentStatus({ paymentId, status, transactionId }) {
  const [result] = await pool.execute(
    `
      UPDATE payments
      SET status = ?, transaction_id = COALESCE(?, transaction_id)
      WHERE id = ?
    `,
    [status, transactionId || null, paymentId]
  );

  return result.affectedRows;
}

async function findPaymentByTransaction(transactionId) {
  const [rows] = await pool.execute(
    "SELECT * FROM payments WHERE transaction_id = ? LIMIT 1",
    [transactionId]
  );

  return rows[0] || null;
}

async function listPayments({ userId = null } = {}) {
  let query = `
    SELECT p.*, c.title AS course_title, u.full_name AS user_name, u.email
    FROM payments p
    INNER JOIN courses c ON p.course_id = c.id
    INNER JOIN users u ON p.user_id = u.id
  `;

  const values = [];

  if (userId) {
    query += " WHERE p.user_id = ?";
    values.push(userId);
  }

  query += " ORDER BY p.created_at DESC";

  const [rows] = await pool.execute(query, values);
  return rows;
}

async function countPaymentSummary() {
  const [rows] = await pool.execute(
    `
      SELECT status, COUNT(*) AS total
      FROM payments
      GROUP BY status
    `
  );

  return rows;
}

module.exports = {
  createPayment,
  updatePaymentStatus,
  findPaymentByTransaction,
  listPayments,
  countPaymentSummary,
};
