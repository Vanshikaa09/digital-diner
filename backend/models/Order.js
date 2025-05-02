// models/Order.js
// This is a PostgreSQL model for orders

const { query } = require('../config/postgres');

class Order {
  // Get all orders
  static async getAll() {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  }

  // Get a single order by ID
  static async getById(id) {
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create a new order
  static async create(orderData) {
    const { customer_id, total_amount, status, pickup_time } = orderData;
    
    const result = await query(
      'INSERT INTO orders (customer_id, total_amount, status, pickup_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_id, total_amount, status || 'pending', pickup_time]
    );
    
    return result.rows[0];
  }

  // Update an order
  static async update(id, orderData) {
    const { customer_id, total_amount, status, pickup_time } = orderData;
    
    const result = await query(
      'UPDATE orders SET customer_id = $1, total_amount = $2, status = $3, pickup_time = $4 WHERE id = $5 RETURNING *',
      [customer_id, total_amount, status, pickup_time, id]
    );
    
    return result.rows[0];
  }

  // Delete an order
  static async delete(id) {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get orders by status
  static async getByStatus(status) {
    const result = await query('SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows;
  }

  // Get orders by customer
  static async getByCustomer(customerId) {
    const result = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
    return result.rows;
  }

  // Update order status
  static async updateStatus(id, status) {
    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return result.rows[0];
  }
}

module.exports = Order;