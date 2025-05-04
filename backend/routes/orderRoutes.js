// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const { 
  createOrder, 
  getOrder, 
  getAllOrders, 
  updateOrder, 
  deleteOrder 
} = require('../controllers/orderController');

// Route to get all orders
router.get('/', getAllOrders);

// Route to create a new order
router.post('/', createOrder);

// Route to get an order by ID
router.get('/:id', getOrder);

// Route to update an order
router.put('/:id', updateOrder);

// Route to delete an order
router.delete('/:id', deleteOrder);

module.exports = router;


