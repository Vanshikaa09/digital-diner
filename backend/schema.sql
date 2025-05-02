-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS customers;

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, preparing, ready, completed, cancelled
    pickup_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL,  -- MongoDB ObjectId as string
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data

-- Sample customer
INSERT INTO customers (name, email, phone) 
VALUES ('John Doe', 'john@example.com', '555-123-4567');

-- Sample users (password is hashed)
INSERT INTO users (username, email, password, role)
VALUES 
('admin', 'admin@example.com', '$2a$10$XO5d0.5kELpQQmHFc.7hbuqfGT6FX6YjTazbMbxFYHpKMKpkGTHzy', 'admin'),
('staff', 'staff@example.com', '$2a$10$XO5d0.5kELpQQmHFc.7hbuqfGT6FX6YjTazbMbxFYHpKMKpkGTHzy', 'staff'),
('customer', 'customer@example.com', '$2a$10$XO5d0.5kELpQQmHFc.7hbuqfGT6FX6YjTazbMbxFYHpKMKpkGTHzy', 'customer');

-- Sample order
INSERT INTO orders (customer_id, total_amount, status, pickup_time)
VALUES (1, 15.99, 'pending', NOW() + INTERVAL '30 minutes');