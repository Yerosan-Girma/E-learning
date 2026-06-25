require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edulearn_db",
  ssl: false,
});

const EMAIL = "zerishyero@gmail.com";
const PASSWORD = "@zerish27101620";
const FULL_NAME = "Zerish Yero";

async function run() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  // Check if user exists
  const existing = await pool.query("SELECT id, role FROM users WHERE email = $1", [EMAIL]);

  if (existing.rows.length > 0) {
    // Update password, role, and status
    const r = await pool.query(
      "UPDATE users SET password_hash = $1, role = 'teacher', status = 'active', full_name = $2 WHERE email = $3 RETURNING id, full_name, email, role, status",
      [hash, FULL_NAME, EMAIL]
    );
    console.log("Teacher account updated:", r.rows[0]);
  } else {
    // Insert new teacher
    const r = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, status) VALUES ($1, $2, $3, 'teacher', 'active') RETURNING id, full_name, email, role, status",
      [FULL_NAME, EMAIL, hash]
    );
    console.log("Teacher account created:", r.rows[0]);
  }

  console.log("\n  Email:    " + EMAIL);
  console.log("  Password: " + PASSWORD);
  console.log("  Role:     teacher\n");

  await pool.end();
}

run().catch((e) => { console.error("Error:", e.message); process.exit(1); });
