// models/Customer.js
// PostgreSQL model for customers

const { query } = require('../config/postgres');

class Customer {
  // Get all customers
  static async getAll() {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    return result.rows;
  }

  // Get a single customer by ID
  static async getById(id) {
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Get a customer by email
  static async getByEmail(email) {
    const result = await query('SELECT * FROM customers WHERE email = $1', [email]);
    return result.rows[0];
  }

  // Create a new customer
  static async create(customerData) {
    const { name, email, phone } = customerData;
    
    const result = await query(
      'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    
    return result.rows[0];
  }

  // Update a customer
  static async update(id, customerData) {
    const { name, email, phone } = customerData;
    
    const result = await query(
      'UPDATE customers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, email, phone, id]
    );
    
    return result.rows[0];
  }

  // Delete a customer
  static async delete(id) {
    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get a customer's orders
  static async getOrders(id) {
    const result = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [id]);
    return result.rows;
  }
}

module.exports = Customer;