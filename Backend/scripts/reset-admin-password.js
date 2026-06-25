/**
 * Run once to reset the admin password.
 * Usage:  node scripts/reset-admin-password.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const ADMIN_EMAIL = "admin@edulearn.com";
const NEW_PASSWORD = "ChangeMe123!";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edulearn_db",
  ssl: false,
});

async function run() {
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);

  const result = await pool.query(
    "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, full_name, email",
    [hash, ADMIN_EMAIL]
  );

  if (result.rowCount === 0) {
    console.log("❌ No user found with email:", ADMIN_EMAIL);
    console.log("   Creating admin account...");
    const ins = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email",
      ["Admin User", ADMIN_EMAIL, hash, "admin", "active"]
    );
    console.log("✅ Admin created:", ins.rows[0]);
  } else {
    console.log("✅ Password updated for:", result.rows[0]);
  }

  console.log("\n  Email:    " + ADMIN_EMAIL);
  console.log("  Password: " + NEW_PASSWORD + "\n");

  await pool.end();
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
