const { pool } = require("../config/db");

async function createNotification({ userId, type, title, message, linkUrl }) {
  const query = `
    INSERT INTO notifications (user_id, type, title, message, link_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  const result = await pool.query(query, [userId, type, title, message, linkUrl]);
  return result.rows[0].id;
}

async function getNotificationsByUser(userId, { limit = 20, unreadOnly = false } = {}) {
  let query = `
    SELECT * FROM notifications
    WHERE user_id = $1
  `;
  const values = [userId];
  let paramIndex = 2;

  if (unreadOnly) {
    query += ` AND is_read = FALSE`;
  }

  query += ` ORDER BY created_at DESC`;

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    values.push(limit);
  }

  const result = await pool.query(query, values);
  return result.rows;
}

async function getNotificationById(id) {
  const query = "SELECT * FROM notifications WHERE id = $1 LIMIT 1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function markAsRead(id) {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rowCount;
}

async function markAllAsRead(userId) {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
  `;
  const result = await pool.query(query, [userId]);
  return result.rowCount;
}

async function deleteNotification(id) {
  const result = await pool.query("DELETE FROM notifications WHERE id = $1", [id]);
  return result.rowCount;
}

async function getUnreadCount(userId) {
  const query = `
    SELECT COUNT(*) AS count
    FROM notifications
    WHERE user_id = $1 AND is_read = FALSE
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].count);
}

async function deleteOldNotifications(daysOld = 30) {
  const query = `
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '${daysOld} days'
  `;
  const result = await pool.query(query);
  return result.rowCount;
}

module.exports = {
  createNotification,
  getNotificationsByUser,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  deleteOldNotifications,
};
