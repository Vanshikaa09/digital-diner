// models/MenuItem.js
const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  image: String // You can use an image URL for now
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
