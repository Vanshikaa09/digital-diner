// controllers/orderItemsController.js
const { query } = require('../config/postgres');

// Add items to an order
const createOrderItem = async (req, res) => {
    const { order_id, item_id, item_name, quantity, price } = req.body;

    try {
        const result = await query(
            'INSERT INTO order_items (order_id, item_id, item_name, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [order_id, item_id, item_name, quantity, price]
        );
        
        // Update the total amount in the orders table
        await query(
            'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
            [price * quantity, order_id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get items for a specific order
const getOrderItems = async (req, res) => {
    const { orderId } = req.params;

    try {
        const result = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No items found for this order' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an order item by ID
const updateOrderItem = async (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;

    try {
        // Get the original order item to calculate price difference
        const originalItem = await query('SELECT * FROM order_items WHERE id = $1', [id]);
        
        if (originalItem.rows.length === 0) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        
        const oldTotal = originalItem.rows[0].price * originalItem.rows[0].quantity;
        const newTotal = price * quantity;
        const priceDifference = newTotal - oldTotal;
        
        // Update the order item
        const result = await query(
            'UPDATE order_items SET quantity = $1, price = $2 WHERE id = $3 RETURNING *',
            [quantity, price, id]
        );
        
        // Update the total amount in the orders table
        await query(
            'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
            [priceDifference, originalItem.rows[0].order_id]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an order item by ID
const deleteOrderItem = async (req, res) => {
    const { id } = req.params;

    try {
        // Get the original order item to calculate price to subtract
        const originalItem = await query('SELECT * FROM order_items WHERE id = $1', [id]);
        
        if (originalItem.rows.length === 0) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        
        const itemTotal = originalItem.rows[0].price * originalItem.rows[0].quantity;
        
        // Delete the order item
        const result = await query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
        
        // Update the total amount in the orders table
        await query(
            'UPDATE orders SET total_amount = total_amount - $1 WHERE id = $2',
            [itemTotal, originalItem.rows[0].order_id]
        );

        res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createOrderItem, getOrderItems, updateOrderItem, deleteOrderItem };


// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'digital-diner',
//     password: '091103',
//     port: 5432,
// });


// // Add items to an order
// const createOrderItem = async (req, res) => {
//     const { order_id, item_id, item_name, quantity, price } = req.body;

//     try {
//         const result = await pool.query(
//             'INSERT INTO order_items (order_id, item_id, item_name, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [order_id, item_id, item_name, quantity, price]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Get items for a specific order
// const getOrderItems = async (req, res) => {
//     const { orderId } = req.params;

//     try {
//         const result = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No items found for this order' });
//         }

//         res.status(200).json(result.rows);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Update an order item by ID
// const updateOrderItem = async (req, res) => {
//     const { id } = req.params;
//     const { quantity, price } = req.body;

//     try {
//         const result = await pool.query(
//             'UPDATE order_items SET quantity = $1, price = $2 WHERE id = $3 RETURNING *',
//             [quantity, price, id]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Order item not found' });
//         }

//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Delete an order item by ID
// const deleteOrderItem = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const result = await pool.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Order item not found' });
//         }

//         res.status(200).json({ message: 'Order item deleted successfully' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// module.exports = { createOrderItem, getOrderItems, updateOrderItem, deleteOrderItem };


