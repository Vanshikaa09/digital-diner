// routes/adminRoutes.js
const express = require("express")
const router = express.Router()
const MenuItem = require("../models/MenuItem")
const { authenticate, isAdmin } = require("../middleware/auth")

// Middleware to ensure only admins can access these routes
router.use(authenticate, isAdmin)

// Get all menu items (admin view)
router.get("/menu", async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 })
    res.json(items)
  } catch (err) {
    console.error("Admin get menu error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Add a new menu item
router.post("/menu", async (req, res) => {
  try {
    const { name, description, category, price, image } = req.body

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" })
    }

    const newItem = new MenuItem({
      name,
      description,
      category,
      price: Number(price),
      image,
    })

    await newItem.save()
    res.status(201).json(newItem)
  } catch (err) {
    console.error("Admin add menu item error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Update a menu item
router.put("/menu/:id", async (req, res) => {
  try {
    const { name, description, category, price, image } = req.body

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        price: Number(price),
        image,
      },
      { new: true },
    )

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    res.json(updatedItem)
  } catch (err) {
    console.error("Admin update menu item error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Delete a menu item
router.delete("/menu/:id", async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id)

    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    res.json({ message: "Menu item deleted successfully" })
  } catch (err) {
    console.error("Admin delete menu item error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Get all orders (admin view)
router.get("/orders", async (req, res) => {
  try {
    const { pool } = require("../config/postgres")

    // Get all orders with customer information
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `)

    res.json(result.rows)
  } catch (err) {
    console.error("Admin get orders error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Update order status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const { pool } = require("../config/postgres")

    const result = await pool.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Admin update order status error:", err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
