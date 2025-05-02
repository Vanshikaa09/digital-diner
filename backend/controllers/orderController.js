// controllers/orderController.js
const { pool } = require("../config/postgres")

// Create a new order
const createOrder = async (req, res) => {
  try {
    console.log("Creating order with data:", req.body)
    const { customer_name, customer_email, customer_phone, total_amount, items } = req.body

    // Begin transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // First, create or get customer
      let customerId
      if (customer_email) {
        // Check if customer exists
        const customerResult = await client.query("SELECT id FROM customers WHERE email = $1", [customer_email])

        if (customerResult.rows.length > 0) {
          customerId = customerResult.rows[0].id
          // Update customer info if needed
          await client.query("UPDATE customers SET name = $1, phone = $2 WHERE id = $3", [
            customer_name,
            customer_phone,
            customerId,
          ])
        } else {
          // Create new customer
          const newCustomerResult = await client.query(
            "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
            [customer_name, customer_email, customer_phone],
          )
          customerId = newCustomerResult.rows[0].id
        }
      }

      // Insert order
      const orderResult = await client.query(
        "INSERT INTO orders (customer_id, total_amount, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [customerId || null, total_amount, "pending"],
      )

      const order = orderResult.rows[0]
      console.log("Order created:", order)

      // Insert order items
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            "INSERT INTO order_items (order_id, item_id, item_name, quantity, price) VALUES ($1, $2, $3, $4, $5)",
            [
              order.id,
              item.menu_item_id || item.menuItemId || "unknown",
              item.name || item.item_name,
              item.quantity,
              item.price,
            ],
          )
        }
      }

      await client.query("COMMIT")

      // Get the complete order with items
      const completeOrder = await getOrderWithItems(order.id)
      res.status(201).json(completeOrder)
    } catch (err) {
      await client.query("ROLLBACK")
      console.error("Transaction error:", err)
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Order creation error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Helper function to get order with items
const getOrderWithItems = async (orderId) => {
  // Get the order
  const orderResult = await pool.query(
    `
    SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = $1
  `,
    [orderId],
  )

  if (orderResult.rows.length === 0) {
    return null
  }

  const order = orderResult.rows[0]

  // Get order items
  const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [orderId])
  order.items = itemsResult.rows

  return order
}

// Get a specific order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params
    const order = await getOrderWithItems(id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json(order)
  } catch (err) {
    console.error("Get order error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    // Get all orders with customer information
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `)

    // Get items for each order
    const orders = result.rows
    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id])
      order.items = itemsResult.rows
    }

    res.status(200).json(orders)
  } catch (err) {
    console.error("Get all orders error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Update an order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params
    const { customer_id, total_amount, status } = req.body

    const result = await pool.query(
      "UPDATE orders SET customer_id = $1, total_amount = $2, status = $3 WHERE id = $4 RETURNING *",
      [customer_id, total_amount, status, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error("Update order error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    // Begin transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Delete order items first (foreign key constraint)
      await client.query("DELETE FROM order_items WHERE order_id = $1", [id])

      // Delete the order
      const result = await client.query("DELETE FROM orders WHERE id = $1 RETURNING *", [id])

      if (result.rows.length === 0) {
        await client.query("ROLLBACK")
        return res.status(404).json({ message: "Order not found" })
      }

      await client.query("COMMIT")
      res.status(200).json({ message: "Order deleted successfully" })
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error("Delete order error:", err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrder,
  deleteOrder,
}

// const { Pool } = require('pg');
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'digital-diner',
//   password: '091103',
//   port: 5432,
// });

// // Create a new order
// const createOrder = async (req, res) => {
//   const { customer_id, total_amount, status, pickup_time } = req.body;

//   try {
//     const result = await pool.query(
//       'INSERT INTO orders (customer_id, total_amount, status, pickup_time) VALUES ($1, $2, $3, $4) RETURNING *',
//       [customer_id, total_amount, status, pickup_time]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get an order by ID
// const getOrder = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// // Update an order item by ID
// const updateOrderItem = async (req, res) => {
//     const { id } = req.params;
//     const { quantity, price } = req.body;
  
//     try {
//       const result = await pool.query(
//         'UPDATE order_items SET quantity = $1, price = $2 WHERE id = $3 RETURNING *',
//         [quantity, price, id]
//       );
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'Order item not found' });
//       }
  
//       res.status(200).json(result.rows[0]);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };
  
//   // Delete an order item by ID
//   const deleteOrderItem = async (req, res) => {
//     const { id } = req.params;
  
//     try {
//       const result = await pool.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'Order item not found' });
//       }
  
//       res.status(200).json({ message: 'Order item deleted successfully' });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };
// module.exports = { createOrder, getOrder ,deleteOrderItem,updateOrderItem};
