// scripts/fix-database.js
require("dotenv").config()
const { pool } = require("../config/postgres")
const bcrypt = require("bcryptjs")

async function fixDatabase() {
  const client = await pool.connect()

  try {
    console.log("Starting database repair...")

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    const existingTables = tablesResult.rows.map((row) => row.table_name)
    console.log("Existing tables:", existingTables)

    // Create tables if they don't exist
    if (!existingTables.includes("customers")) {
      console.log("Creating customers table...")
      await client.query(`
        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!existingTables.includes("users")) {
      console.log("Creating users table...")
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'customer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!existingTables.includes("orders")) {
      console.log("Creating orders table...")
      await client.query(`
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id),
          total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          pickup_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    if (!existingTables.includes("order_items")) {
      console.log("Creating order_items table...")
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
      `)
    }

    // Check if admin user exists
    const adminResult = await client.query(`
      SELECT * FROM users WHERE role = 'admin'
    `)

    if (adminResult.rows.length === 0) {
      console.log("Creating admin user...")
      // Create admin user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await client.query(
        `
        INSERT INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', $1, 'admin')
      `,
        [hashedPassword],
      )

      console.log("Admin user created with:")
      console.log("Username: admin")
      console.log("Email: admin@example.com")
      console.log("Password: admin123")
    } else {
      console.log("Admin user already exists")

      // Reset admin password
      console.log("Resetting admin password...")
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await client.query(
        `
        UPDATE users 
        SET password = $1
        WHERE role = 'admin'
      `,
        [hashedPassword],
      )

      console.log("Admin password reset to: admin123")
    }

    // Insert sample customer if none exists
    const customerResult = await client.query(`
      SELECT COUNT(*) FROM customers
    `)

    if (Number.parseInt(customerResult.rows[0].count) === 0) {
      console.log("Adding sample customer...")
      await client.query(`
        INSERT INTO customers (name, email, phone)
        VALUES ('John Doe', 'john@example.com', '555-123-4567')
      `)
    }

    console.log("Database repair completed successfully!")
  } catch (error) {
    console.error("Error fixing database:", error)
  } finally {
    client.release()
    await pool.end()
  }
}

fixDatabase()
