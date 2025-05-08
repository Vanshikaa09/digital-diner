// config/postgres.js
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 resolution

const { Pool } = require('pg');
require('dotenv').config();

// You can choose between using individual credentials or DATABASE_URL
const useDatabaseURL = !!process.env.DATABASE_URL;

const pool = useDatabaseURL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    })
  : new Pool({
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'kunalvanshika',
      host: process.env.PGHOST || 'db.zguqoflufgnjdbwlmpfl.supabase.co',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'postgres',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    });

// Log any pool errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Test DB connection
async function testConnection() {
  let client;
  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully');

    const result = await client.query('SELECT NOW()');
    console.log('🕒 Server time:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);

    if (err.code === 'ENOTFOUND') {
      console.error('⚠️ Hostname could not be resolved.');
    } else if (err.code === '28P01') {
      console.error('⚠️ Invalid authentication credentials.');
    } else if (err.code === 'ENETUNREACH') {
      console.error('⚠️ Network unreachable — check IPv6/IPv4 or firewall rules.');
    }

    return false;
  } finally {
    if (client) client.release();
  }
}

testConnection();

// Reusable DB query helper
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

module.exports = { pool, query };
// // config/postgres.js - FINAL
// const { Pool } = require('pg');
// require('dotenv').config();

// // Initialize pool with correct connection parameters
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   user: 'postgres',
//   password: "kunalvanshika", 
//   host: 'db.zguqoflufgnjdbwlmpfl.supabase.co',
//   port: 5432,
//   database: 'postgres',
//   ssl: {
//     rejectUnauthorized: false // Required for Supabase connections
//   },
//   connectionTimeoutMillis: 10000,
//   idleTimeoutMillis: 30000
// });

// // Add connection monitoring
// pool.on('error', (err) => {
//   console.error('Unexpected PostgreSQL pool error:', err);
// });

// // Test the connection with better diagnostics
// async function testConnection() {
//   let client;
//   try {
//     console.log('Attempting to connect to PostgreSQL...');
//     console.log(`Host: ${pool.options.host}`);
    
//     client = await pool.connect();
//     console.log('Connected to PostgreSQL successfully');
    
//     // Test query to verify full connectivity
//     const result = await client.query('SELECT NOW()');
//     console.log('Query successful, server time:', result.rows[0].now);
    
//     return true;
//   } catch (err) {
//     console.error('PostgreSQL connection error:', err);
    
//     // Network error diagnostics
//     if (err.code === 'ENOTFOUND') {
//       console.error('⚠️ Hostname cannot be resolved. Possible causes:');
//       console.error('  - Check your internet connection');
//       console.error('  - Verify the database host is correct');
//       console.error('  - Your Supabase project might be paused or deleted');
//     } 
//     // Authentication error diagnostics
//     else if (err.code === '28P01') {
//       console.error('⚠️ Authentication failed. Check your username and password.');
//     }
    
//     return false;
//   } finally {
//     if (client) client.release();
//   }
// }

// // Run the test connection immediately
// testConnection();

// // Helper function for database queries
// const query = async (text, params) => {
//   try {
//     const result = await pool.query(text, params);
//     return result;
//   } catch (error) {
//     console.error('Database query error:', error);
//     throw error;
//   }
// };

// module.exports = { pool, query };