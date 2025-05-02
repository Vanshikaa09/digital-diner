// routes/orderItemsRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrderItem, 
  getOrderItems, 
  updateOrderItem, 
  deleteOrderItem 
} = require('../controllers/orderItemsController');

// Route to add items to an order
router.post('/', createOrderItem);

// Route to get items of a specific order
router.get('/:orderId', getOrderItems);



// Route to update an order item by ID
router.put('/:id', updateOrderItem);

// Route to delete an order item by ID
router.delete('/:id', deleteOrderItem);

module.exports = router;
