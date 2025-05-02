// models/OrderItem.js
// This is a PostgreSQL model for order items

const { query } = require('../config/postgres');

class OrderItem {
  // Get all order items
  static async getAll() {
    const result = await query('SELECT * FROM order_items ORDER BY created_at DESC');
    return result.rows;
  }

  // Get all items for a specific order
  static async getByOrderId(orderId) {
    const result = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    return result.rows;
  }

  // Get a single order item by ID
  static async getById(id) {
    const result = await query('SELECT * FROM order_items WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create a new order item
  static async create(itemData) {
    const { order_id, item_id, item_name, quantity, price } = itemData;
    
    const result = await query(
      'INSERT INTO order_items (order_id, item_id, item_name, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [order_id, item_id, item_name, quantity, price]
    );
    
    return result.rows[0];
  }

  // Update an order item
  static async update(id, itemData) {
    const { order_id, item_id, item_name, quantity, price } = itemData;
    
    const result = await query(
      'UPDATE order_items SET order_id = $1, item_id = $2, item_name = $3, quantity = $4, price = $5 WHERE id = $6 RETURNING *',
      [order_id, item_id, item_name, quantity, price, id]
    );
    
    return result.rows[0];
  }

  // Delete an order item
  static async delete(id) {
    const result = await query('DELETE FROM order_items WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Delete all items for a specific order
  static async deleteByOrderId(orderId) {
    const result = await query('DELETE FROM order_items WHERE order_id = $1 RETURNING *', [orderId]);
    return result.rows;
  }
}

module.exports = OrderItem;