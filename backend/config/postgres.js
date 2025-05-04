// config/postgres.js
const { Pool } = require('pg');
require('dotenv').config();

// Initialize pool with environment variables
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '091103',
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5433,
  database: process.env.PGDATABASE || 'digital-diner',
});

// Test the connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Helper function for database queries
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = { pool, query };

