// scripts/db-reset.js
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function resetDatabase() {
  console.log(`${colors.bright}${colors.blue}=== Digital Diner Database Reset Tool ===${colors.reset}\n`);
  
  // Load schema file
  let schema;
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(`${colors.green}✓ Schema file loaded successfully${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Could not load schema file: ${error.message}${colors.reset}`);
    console.log('Proceeding with manual table creation...');
  }
  
  // Create a standalone client for this operation
  const connectionConfig = {
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'Kunal@1411',
    host: process.env.PGHOST || 'db.zguqoflufgnjdbwlmpfl.supabase.co',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  };
  
  const client = new Client(connectionConfig);
  
  try {
    console.log(`${colors.yellow}Connecting to database...${colors.reset}`);
    await client.connect();
    console.log(`${colors.green}✓ Connected to PostgreSQL${colors.reset}\n`);
    
    // Begin transaction
    await client.query('BEGIN');
    
    if (schema) {
      try {
        console.log(`${colors.yellow}Executing schema.sql...${colors.reset}`);
        await client.query(schema);
        console.log(`${colors.green}✓ Schema executed successfully${colors.reset}\n`);
      } catch (error) {
        console.log(`${colors.red}✗ Error executing schema: ${error.message}${colors.reset}`);
        console.log('Proceeding with manual table creation...');
        
        // Rollback and try manual creation
        await client.query('ROLLBACK');
        await client.query('BEGIN');
      }
    }
    
    // If schema execution failed or we didn't have a schema, create tables manually
    if (!schema || schema.indexOf('Error executing schema') > -1) {
      console.log(`${colors.yellow}Creating tables manually...${colors.reset}`);
      
      // Drop tables in reverse order to respect dependencies
      console.log('Dropping existing tables...');
      await client.query(`
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS customers;
      `);
      
      // Create customers table
      console.log('Creating customers table...');
      await client.query(`
        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create users table
      console.log('Creating users table...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'customer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create orders table
      console.log('Creating orders table...');
      await client.query(`
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id),
          total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          pickup_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create order_items table
      console.log('Creating order_items table...');
      await client.query(`
        CREATE TABLE order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          item_id VARCHAR(50) NOT NULL,
          item_name VARCHAR(100) NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`${colors.green}✓ Tables created successfully${colors.reset}\n`);
    }
    
    // Create admin user
    console.log(`${colors.yellow}Setting up admin user...${colors.reset}`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Check if admin user exists
    const adminResult = await client.query(`
      SELECT * FROM users WHERE username = 'admin'
    `);
    
    if (adminResult.rows.length === 0) {
      // Insert admin user
      await client.query(`
        INSERT INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', $1, 'admin')
      `, [hashedPassword]);
      console.log(`${colors.green}✓ Admin user created${colors.reset}`);
    } else {
      // Update admin password
      await client.query(`
        UPDATE users
        SET password = $1
        WHERE username = 'admin'
      `, [hashedPassword]);
      console.log(`${colors.green}✓ Admin password reset${colors.reset}`);
    }
    
    // Create sample customer
    console.log(`${colors.yellow}Setting up sample customer...${colors.reset}`);
    const customerResult = await client.query(`
      SELECT * FROM customers WHERE email = 'john@example.com'
    `);
    
    if (customerResult.rows.length === 0) {
      await client.query(`
        INSERT INTO customers (name, email, phone)
        VALUES ('John Doe', 'john@example.com', '555-123-4567')
      `);
      console.log(`${colors.green}✓ Sample customer created${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Sample customer already exists${colors.reset}`);
    }
    
    // Create sample order
    console.log(`${colors.yellow}Setting up sample order...${colors.reset}`);
    const orderResult = await client.query(`
      SELECT * FROM orders LIMIT 1
    `);
    
    if (orderResult.rows.length === 0) {
      // Get customer ID
      const customerIdResult = await client.query(`
        SELECT id FROM customers WHERE email = 'john@example.com'
      `);
      
      if (customerIdResult.rows.length > 0) {
        const customerId = customerIdResult.rows[0].id;
        
        // Create order
        const orderInsertResult = await client.query(`
          INSERT INTO orders (customer_id, total_amount, status, pickup_time)
          VALUES ($1, 15.99, 'pending', NOW() + INTERVAL '30 minutes')
          RETURNING id
        `, [customerId]);
        
        const orderId = orderInsertResult.rows[0].id;
        
        // Add order item
        await client.query(`
          INSERT INTO order_items (order_id, item_id, item_name, quantity, price)
          VALUES ($1, 'sample123', 'Burger Combo', 1, 15.99)
        `, [orderId]);
        
        console.log(`${colors.green}✓ Sample order created${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}✓ Sample order already exists${colors.reset}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n${colors.bright}${colors.green}✓ Database setup completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}Admin Credentials:${colors.reset}`);
    console.log(`  Username: admin`);
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: admin123`);
    
  } catch (error) {
    console.log(`\n${colors.red}✗ Error during database reset: ${error.message}${colors.reset}`);
    
    // Try to rollback transaction
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // Ignore rollback error
    }
  } finally {
    // Close connection
    await client.end();
  }
}

resetDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
