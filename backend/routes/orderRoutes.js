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


// // routes/orderRoutes.js
//  // Import the pool

// const express = require('express');
// const router = express.Router();
// const {pool} = require('../config/postgres')
// const { createOrder, getOrder, updateOrderItem, deleteOrderItem } = require('../controllers/orderController');

// // Route to create a new order
// router.post('/', createOrder);

// // Route to get an order by ID
// router.get('/:id', getOrder);

// // Route to update an order item by ID
// router.put('/:id', updateOrderItem);

// // Route to delete an order item by ID
// router.delete('/:id', deleteOrderItem);

// // Route to get all orders (new route)
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM orders');
//     res.status(200).json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
