require("dotenv").config();
const { pool } = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Running subscriptions table migration...");
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "add_subscriptions_table.postgres.sql"),
      "utf8"
    );
    
    await client.query(migrationSQL);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log("Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration process failed:", error);
    process.exit(1);
  });
