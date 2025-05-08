// routes/debug-routes.js
const express = require('express');
const router = express.Router();
const { query } = require('../config/postgres');

// PostgreSQL connection test
router.get('/postgres', async (req, res) => {
  try {
    // Simple query to test connection
    const result = await query('SELECT NOW() as current_time');
    
    // Return success with database time
    res.json({
      success: true,
      message: 'PostgreSQL connection successful',
      timestamp: result.rows[0].current_time,
      tables: await getTableStats()
    });
  } catch (error) {
    console.error('PostgreSQL test route error:', error);
    res.status(500).json({
      success: false,
      message: 'PostgreSQL connection failed',
      error: error.message,
      hint: 'Check your database configuration and credentials'
    });
  }
});

// Function to get table statistics
async function getTableStats() {
  try {
    const tableResult = await query(`
      SELECT 
        table_name, 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
      FROM 
        information_schema.tables t
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `);
    
    // Get row counts for each table
    const tables = [];
    for (const table of tableResult.rows) {
      try {
        const countResult = await query(`SELECT COUNT(*) FROM "${table.table_name}"`);
        tables.push({
          name: table.table_name,
          columns: parseInt(table.column_count),
          rows: parseInt(countResult.rows[0].count)
        });
      } catch (error) {
        // If counting fails, just add what we know
        tables.push({
          name: table.table_name,
          columns: parseInt(table.column_count),
          rows: 'error counting rows'
        });
      }
    }
    
    return tables;
  } catch (error) {
    console.error('Error getting table stats:', error);
    return [{error: 'Failed to get table statistics'}];
  }
}

// Full environment report
router.get('/environment', (req, res) => {
  // Collect information about the environment
  const environment = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    env: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()) + ' seconds',
    memory: process.memoryUsage()
  };
  
  // Database configs (remove sensitive data)
  const dbConfig = {
    postgres: {
      host: process.env.PGHOST || 'not set',
      database: process.env.PGDATABASE || 'not set',
      user: process.env.PGUSER || 'not set',
      port: process.env.PGPORT || 'not set',
      // Never include password
    }
  };
  
  res.json({
    success: true,
    environment,
    database: dbConfig
  });
});

module.exports = router;