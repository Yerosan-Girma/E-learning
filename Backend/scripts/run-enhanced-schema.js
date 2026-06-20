const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { pool } = require('../config/db');

async function runEnhancedSchema() {
  try {
    console.log('Reading enhanced schema file...');
    const schemaPath = path.join(__dirname, '../database/schema-enhanced.postgres.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    console.log('Executing enhanced schema...');
    await pool.query(schemaSQL);
    console.log('Enhanced schema executed successfully');
    
    console.log('Closing connection...');
    await pool.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error running enhanced schema:', error);
    process.exit(1);
  }
}

runEnhancedSchema();
