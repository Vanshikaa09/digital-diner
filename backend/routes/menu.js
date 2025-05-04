// routes/menu.js
const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");


// GET all menu items
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a specific menu item by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching the menu item" });
  }
});
// POST a new menu item
router.post("/", async (req, res) => {
  const { name, description, category, price, image } = req.body;
  try {
    const newItem = new MenuItem({ name, description, category, price, image });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
