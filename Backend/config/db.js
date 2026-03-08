const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edulearn_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    await ensureSchema(connection);
  } finally {
    connection.release();
  }
}

async function ensureSchema(connection) {
  try {
    await connection.execute(
      "UPDATE payments SET gateway = 'manual' WHERE gateway NOT IN ('telebirr', 'manual')"
    );

    await connection.execute(
      `
        ALTER TABLE payments
        MODIFY COLUMN gateway ENUM('telebirr', 'manual')
        NOT NULL DEFAULT 'telebirr'
      `
    );
  } catch (error) {
    if (error.code !== "ER_NO_SUCH_TABLE") {
      throw error;
    }
  }
}

module.exports = {
  pool,
  testConnection,
};
