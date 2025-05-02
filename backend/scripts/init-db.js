// scripts/init-db.js
require("dotenv").config()
const { pool } = require("../config/postgres")
const fs = require("fs")
const path = require("path")

async function initializeDatabase() {
  try {
    console.log("Starting database initialization...")

    // Read the schema file
    const schemaPath = path.join(__dirname, "../schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Connect to the database
    const client = await pool.connect()

    try {
      console.log("Executing schema...")
      // Execute the schema
      await client.query(schema)
      console.log("Database initialized successfully!")
    } finally {
      client.release()
    }

    // Close the pool
    await pool.end()
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  }
}

initializeDatabase()
