// scripts/create-admin.js
require("dotenv").config()
const { pool } = require("../config/postgres")
const bcrypt = require("bcryptjs")

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    // Admin user details
    const username = "admin"
    const email = "admin@example.com"
    const password = "password123" // Change this to a secure password
    const role = "admin"

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Connect to the database
    const client = await pool.connect()

    try {
      // Check if users table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `)

      if (!tableCheck.rows[0].exists) {
        console.error("Users table does not exist. Please run the schema.sql first.")
        return
      }

      // Check if admin user already exists
      const userCheck = await client.query("SELECT * FROM users WHERE email = $1", [email])

      if (userCheck.rows.length > 0) {
        console.log("Admin user already exists.")
        return
      }

      // Create admin user
      await client.query("INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)", [
        username,
        email,
        hashedPassword,
        role,
      ])

      console.log("Admin user created successfully!")
      console.log("Username:", username)
      console.log("Email:", email)
      console.log("Password:", password)
      console.log("Role:", role)
    } finally {
      client.release()
    }

    // Close the pool
    await pool.end()
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdminUser()
