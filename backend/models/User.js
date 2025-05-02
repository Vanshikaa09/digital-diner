// models/User.js
// PostgreSQL model for users

const { query } = require('../config/postgres');
const bcrypt = require('bcryptjs');

class User {
  // Get all users
  static async getAll() {
    const result = await query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  // Get a single user by ID
  static async getById(id) {
    const result = await query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Get a user by username
  static async getByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  // Get a user by email
  static async getByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password, role = 'customer' } = userData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword, role]
    );
    
    return result.rows[0];
  }

  // Update a user
  static async update(id, userData) {
    const { username, email, role } = userData;
    
    let result;
    
    // If password is included, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      result = await query(
        'UPDATE users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, created_at',
        [username, email, hashedPassword, role, id]
      );
    } else {
      result = await query(
        'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at',
        [username, email, role, id]
      );
    }
    
    return result.rows[0];
  }

  // Delete a user
  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  // Authenticate user (login)
  static async authenticate(email, password) {
    // Get user by email
    const user = await this.getByEmail(email);
    
    // If user not found
    if (!user) {
      return null;
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      // Don't return the password
      delete user.password;
      return user;
    } else {
      return null;
    }
  }
}

module.exports = User;