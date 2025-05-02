// routes/debug.js
const express = require("express")
const router = express.Router()
const { pool } = require("../config/postgres")
const mongoose = require("mongoose")

// Test PostgreSQL connection
router.get("/postgres", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as time")
    res.json({
      status: "success",
      message: "PostgreSQL connection successful",
      time: result.rows[0].time,
      database: pool.options.database,
    })
  } catch (error) {
    console.error("PostgreSQL connection test error:", error)
    res.status(500).json({
      status: "error",
      message: "PostgreSQL connection failed",
      error: error.message,
    })
  }
})

// Test MongoDB connection
router.get("/mongodb", async (req, res) => {
  try {
    const status = mongoose.connection.readyState
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    res.json({
      status: "success",
      message: `MongoDB connection status: ${statusMap[status]}`,
      connectionStatus: statusMap[status],
    })
  } catch (error) {
    console.error("MongoDB connection test error:", error)
    res.status(500).json({
      status: "error",
      message: "MongoDB connection test failed",
      error: error.message,
    })
  }
})

// Test orders table
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM orders")
    res.json({
      status: "success",
      message: "Orders table accessible",
      count: Number.parseInt(result.rows[0].count),
    })
  } catch (error) {
    console.error("Orders table test error:", error)
    res.status(500).json({
      status: "error",
      message: "Orders table test failed",
      error: error.message,
    })
  }
})

module.exports = router
