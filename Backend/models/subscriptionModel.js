const { pool } = require("../config/db");

async function createSubscription({ userId, planType, amount, gateway, transactionId, endDate, autoRenew }) {
  const query = `
    INSERT INTO subscriptions (user_id, plan_type, amount, gateway, transaction_id, end_date, auto_renew)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;
  const result = await pool.query(query, [userId, planType, amount, gateway, transactionId, endDate, autoRenew]);
  return result.rows[0].id;
}

async function getSubscriptionById(id) {
  const query = "SELECT * FROM subscriptions WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function getActiveSubscriptionByUser(userId) {
  const query = `
    SELECT * FROM subscriptions
    WHERE user_id = $1 AND status = 'active' AND (end_date IS NULL OR end_date > NOW())
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

async function getSubscriptionsByUser(userId) {
  const query = `
    SELECT * FROM subscriptions
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function updateSubscription(id, { status, endDate, autoRenew }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (endDate !== undefined) {
    fields.push(`end_date = $${paramIndex++}`);
    values.push(endDate);
  }
  if (autoRenew !== undefined) {
    fields.push(`auto_renew = $${paramIndex++}`);
    values.push(autoRenew);
  }

  if (fields.length === 0) return 0;

  values.push(id);
  const result = await pool.query(
    `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
  return result.rowCount;
}

async function cancelSubscription(id) {
  const query = `
    UPDATE subscriptions
    SET status = 'cancelled', auto_renew = FALSE
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rowCount;
}

async function checkUserHasActiveSubscription(userId) {
  try {
    const subscription = await getActiveSubscriptionByUser(userId);
    return subscription !== null;
  } catch (error) {
    // If subscriptions table doesn't exist, return false
    if (error.code === '42P01') { // table does not exist
      return false;
    }
    throw error;
  }
}

module.exports = {
  createSubscription,
  getSubscriptionById,
  getActiveSubscriptionByUser,
  getSubscriptionsByUser,
  updateSubscription,
  cancelSubscription,
  checkUserHasActiveSubscription,
};
