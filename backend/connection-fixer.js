// connection-fixer.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

// Function to test different connection scenarios
async function testConnections() {
  console.log('=== PostgreSQL Connection Diagnostics ===\n');
  
  // 1. First, try to resolve the hostname to confirm DNS is working
  try {
    console.log(`Resolving hostname: ${process.env.PGHOST || 'db.zguqoflufgnjdbwlmpfl.supabase.co'}`);
    const addresses = await dns.resolve4(process.env.PGHOST || 'db.zguqoflufgnjdbwlmpfl.supabase.co');
    console.log(`✓ DNS Resolution successful: ${addresses.join(', ')}\n`);
  } catch (error) {
    console.log(`✗ DNS Resolution failed: ${error.message}\n`);
    console.log('Trying alternative hostnames...');
  }
  
  // Connection configurations to try
  const configs = [
    {
      name: 'Standard connection with db. prefix',
      config: {
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'kunalvanshika',
        host: 'db.zguqoflufgnjdbwlmpfl.supabase.co',
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      }
    },
    {
      name: 'Connection without db. prefix',
      config: {
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'kunalvanshika',
        host: 'zguqoflufgnjdbwlmpfl.supabase.co',
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      }
    },
    {
      name: 'Connection string format',
      config: {
        connectionString: `postgresql://postgres:${encodeURIComponent('Kunal@1411')}@db.zguqoflufgnjdbwlmpfl.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      }
    },
    {
      name: 'Connection with alternate port',
      config: {
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'kunalvanshika',
        host: 'db.zguqoflufgnjdbwlmpfl.supabase.co',
        port: 6543, // Supabase sometimes uses alternate ports
        database: process.env.PGDATABASE || 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      }
    }
  ];
  
  let successfulConfig = null;
  
  // Try each configuration
  for (const { name, config } of configs) {
    console.log(`\nTrying: ${name}`);
    console.log('Connection details:');
    // Print config without showing full password
    const sanitizedConfig = {...config};
    if (sanitizedConfig.password) {
      sanitizedConfig.password = 'Kuna***** (masked for security)';
    }
    if (sanitizedConfig.connectionString) {
      sanitizedConfig.connectionString = sanitizedConfig.connectionString.replace(/:[^:]*@/, ':****@');
    }
    console.log(sanitizedConfig);
    
    // Try to connect
    const client = new Client(config);
    
    try {
      await client.connect();
      console.log('✓ Connection successful!');
      
      // Test query
      const res = await client.query('SELECT current_database() as db, current_user as user');
      console.log(`Connected to database: ${res.rows[0].db} as user: ${res.rows[0].user}`);
      
      // Test table access
      try {
        const tableRes = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          LIMIT 5
        `);
        console.log('Available tables:');
        tableRes.rows.forEach(row => console.log(`- ${row.table_name}`));
      } catch (tableErr) {
        console.log(`Table query error: ${tableErr.message}`);
      }
      
      successfulConfig = config;
      await client.end();
      break;
    } catch (error) {
      console.log(`✗ Connection failed: ${error.message}`);
      try {
        await client.end();
      } catch (e) {
        // Ignore end error
      }
    }
  }
  
  return successfulConfig;
}

// Function to update connection details in files
async function updateConnectionFiles(workingConfig) {
  if (!workingConfig) {
    console.log('\n❌ No successful connection found. Cannot update files.');
    return;
  }
  
  console.log('\n=== Updating Configuration Files ===');
  
  // 1. Update .env file
  try {
    console.log('\nUpdating .env file...');
    
    let envContent = '';
    try {
      envContent = fs.readFileSync('.env', 'utf8');
    } catch (err) {
      console.log('No existing .env file found. Creating new one.');
      envContent = '';
    }
    
    const envVars = {
      PGUSER: workingConfig.user || 'postgres',
      PGPASSWORD: workingConfig.password || 'kunalvanshika',
      PGHOST: workingConfig.host || 'db.zguqoflufgnjdbwlmpfl.supabase.co',
      PGPORT: workingConfig.port || 5432,
      PGDATABASE: workingConfig.database || 'postgres',
      DATABASE_URL: workingConfig.connectionString || 
        `postgresql://${workingConfig.user || 'postgres'}:${encodeURIComponent(workingConfig.password || 'Kunal@1411')}@${workingConfig.host || 'db.zguqoflufgnjdbwlmpfl.supabase.co'}:${workingConfig.port || 5432}/${workingConfig.database || 'postgres'}`
    };
    
    let newEnvContent = '';
    
    // Update existing variables or add new ones
    for (const [key, value] of Object.entries(envVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        newEnvContent += `${key}=${value}\n`;
      }
    }
    
    fs.writeFileSync('.env', envContent + newEnvContent);
    console.log('✓ .env file updated successfully');
  } catch (error) {
    console.log(`✗ Error updating .env file: ${error.message}`);
  }
  
  // 2. Create an updated postgres.js file
  try {
    console.log('\nCreating updated postgres.js...');
    
    const pgConfig = `// config/postgres.js - UPDATED
const { Pool } = require('pg');
require('dotenv').config();

// Initialize pool with successful configuration
const pool = new Pool({
  ${workingConfig.connectionString ? 
    `connectionString: process.env.DATABASE_URL || '${workingConfig.connectionString}',` :
    `user: process.env.PGUSER || '${workingConfig.user || 'postgres'}',
  password: process.env.PGPASSWORD || '${workingConfig.password || 'Kunal@1411'}',
  host: process.env.PGHOST || '${workingConfig.host || 'db.zguqoflufgnjdbwlmpfl.supabase.co'}',
  port: process.env.PGPORT || ${workingConfig.port || 5432},
  database: process.env.PGDATABASE || '${workingConfig.database || 'postgres'}',`
  }
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  },
  // Add connection timeout to prevent hanging
  connectionTimeoutMillis: 10000,
  // Add idle timeout to manage connection pool better
  idleTimeoutMillis: 30000
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
`;

    // Create directory if it doesn't exist
    const configDir = path.join(process.cwd(), 'config');
    if (!fs.existsSync(configDir)){
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(configDir, 'postgres.js'), pgConfig);
    fs.writeFileSync(path.join(process.cwd(), 'postgres.js.new'), pgConfig);
    console.log('✓ New postgres.js file created');
    console.log('  - Saved to config/postgres.js');
    console.log('  - Backup saved to postgres.js.new');
    
  } catch (error) {
    console.log(`✗ Error creating postgres.js file: ${error.message}`);
  }
  
  console.log('\n=== Connection Setup Complete ===');
  console.log('Next steps:');
  console.log('1. Replace your existing config/postgres.js with the new version');
  console.log('2. Run your application to test the connection');
  console.log('3. If issues persist, check Supabase dashboard for IP restrictions');
}

// Main function
async function main() {
  console.log('Starting PostgreSQL connection diagnostics and repair...\n');
  
  const workingConfig = await testConnections();
  
  if (workingConfig) {
    console.log('\n✅ Found a working connection configuration!');
    await updateConnectionFiles(workingConfig);
  } else {
    console.log('\n❌ All connection attempts failed.');
    console.log('\nPossible solutions:');
    console.log('1. Check your Supabase dashboard for correct connection information');
    console.log('2. Verify that your IP is allowed in Supabase network settings');
    console.log('3. Try connecting from a different network (e.g., mobile hotspot)');
    console.log('4. Contact Supabase support if issues persist');
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});