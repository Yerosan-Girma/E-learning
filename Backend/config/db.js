const { Pool } = require("pg");
const { ensurePlatformSeedData } = require("../services/bootstrapService");

// Helper function to parse SSL configuration from environment variable
function parseSSLConfig(sslConfig) {
  if (!sslConfig) {
    return process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
  }
  
  if (sslConfig.toLowerCase() === "false") {
    return false;
  }
  
  if (sslConfig.toLowerCase() === "true") {
    return { rejectUnauthorized: false };
  }
  
  // For complex SSL configurations, this would need to parse JSON or other formats
  // For now, default to production SSL with rejectUnauthorized: false
  return { rejectUnauthorized: false };
}

// PostgreSQL connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432), // PostgreSQL default port
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edulearn_db",
  ssl: parseSSLConfig(process.env.DB_SSL),
  max: Number(process.env.DB_POOL_MAX || 10), // maximum number of clients in the pool
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000), // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT || 2000), // how long to wait for a connection
  application_name: "edulearn-backend"
});

// PostgreSQL error code mapping for common errors
const PostgresErrorCodes = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  INVALID_TEXT_REPRESENTATION: "22P02",
  UNDEFINED_COLUMN: "42703",
  UNDEFINED_TABLE: "42P01",
  CONNECTION_FAILURE: "08006"
};

// Connection health check function
async function testConnection() {
  try {
    // Test connection with a simple query
    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
    console.log("PostgreSQL connection test successful:", {
      current_time: result.rows[0].current_time,
      version: result.rows[0].pg_version
    });
    
    await ensureSchema();
    return { healthy: true, timestamp: result.rows[0].current_time };
  } catch (error) {
    console.error("PostgreSQL connection test failed:", {
      code: error.code,
      message: error.message,
      detail: error.detail
    });
    return { 
      healthy: false, 
      error: error.message,
      code: error.code 
    };
  }
}

// PostgreSQL-specific migration runner
async function runMigration(statement, ignorableCodes = []) {
  try {
    await pool.query(statement);
    console.log("Migration executed successfully");
  } catch (error) {
    // Check if this error should be ignored
    if (ignorableCodes.includes(error.code)) {
      console.log(`Migration warning (ignored error code ${error.code}): ${error.message}`);
      return;
    }
    
    // Log the error and re-throw
    console.error("Migration failed:", {
      code: error.code,
      message: error.message,
      detail: error.detail,
      statement: statement.substring(0, 200) + (statement.length > 200 ? "..." : "")
    });
    throw error;
  }
}

// Convert MySQL-specific SQL to PostgreSQL
async function ensureSchema() {
  // Note: These migrations assume PostgreSQL schema already exists
  // The main schema creation should be done via separate migration scripts
  
  // Add level column to courses if it doesn't exist
  await runMigration(
    `
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS level VARCHAR(50) NOT NULL DEFAULT 'All Levels'
    `,
    [PostgresErrorCodes.UNDEFINED_TABLE]
  );

  await runMigration(
    `
      ALTER TABLE course_lessons
      ADD COLUMN IF NOT EXISTS module_name VARCHAR(120)
    `,
    [PostgresErrorCodes.UNDEFINED_TABLE]
  );

  // Update payments gateway enum constraints
  // PostgreSQL doesn't have ENUM types like MySQL, so we use CHECK constraints
  await runMigration(
    `
      DO $$
      BEGIN
        -- First, update any 'manual' values to 'bank_transfer'
        UPDATE payments SET gateway = 'bank_transfer' WHERE gateway = 'manual';
        
        -- Drop and recreate gateway constraint to include card payment methods
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_gateway_check;
        ALTER TABLE payments
        ADD CONSTRAINT payments_gateway_check
        CHECK (gateway IN ('telebirr', 'bank_transfer', 'cash', 'credit_card', 'debit_card'));
        
        -- Set default if column exists
        ALTER TABLE payments 
        ALTER COLUMN gateway SET DEFAULT 'telebirr';
      END $$;
    `,
    [PostgresErrorCodes.UNDEFINED_TABLE]
  );

  // Create course_quizzes table if it doesn't exist
  await runMigration(
    `
      CREATE TABLE IF NOT EXISTS course_quizzes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        title VARCHAR(180) NOT NULL,
        description TEXT,
        passing_score DECIMAL(5,2) NOT NULL DEFAULT 60.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_quiz_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `
  );

  // Create quiz_questions table if it doesn't exist
  await runMigration(
    `
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        options_json JSONB NOT NULL,
        correct_option INTEGER NOT NULL,
        explanation TEXT,
        sort_order INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE
      )
    `
  );

  // Create quiz_attempts table if it doesn't exist
  await runMigration(
    `
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id BIGSERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        total_questions INTEGER NOT NULL DEFAULT 0,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        answers_json JSONB,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES course_quizzes(id) ON DELETE CASCADE,
        CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
  );

  // Create updated_at trigger function if it doesn't exist
  await runMigration(
    `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `
  );

  // Add triggers to tables that need automatic updated_at updates
  await runMigration(
    `
      DO $$
      BEGIN
        -- Add trigger to course_quizzes if it exists and doesn't have the trigger
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_quizzes') 
        AND NOT EXISTS (
          SELECT 1 FROM pg_trigger 
          WHERE tgname = 'update_course_quizzes_updated_at'
        ) THEN
          CREATE TRIGGER update_course_quizzes_updated_at BEFORE UPDATE
          ON course_quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        
        -- Add trigger to quiz_questions if it exists and doesn't have the trigger
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') 
        AND NOT EXISTS (
          SELECT 1 FROM pg_trigger 
          WHERE tgname = 'update_quiz_questions_updated_at'
        ) THEN
          CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE
          ON quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `
  );

  // Seed demo data
  try {
    await ensurePlatformSeedData(pool);
    console.log("Demo data seeding completed");
  } catch (error) {
    console.error("Demo data seeding failed:", error.message);
    // Don't throw here - seeding failures shouldn't break startup
  }
}

// Add error event listener for connection issues
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", {
    message: err.message,
    code: err.code,
    stack: err.stack
  });
  // In production, you might want to implement reconnection logic here
});

module.exports = {
  pool,
  testConnection,
  runMigration,
  ensureSchema,
  PostgresErrorCodes
};