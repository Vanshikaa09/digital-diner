// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/userController');
const { authenticate, isAdmin, isStaff } = require('../middleware/auth');

// Register a new user
router.post('/register', registerUser);
    
// Login a user
router.post('/login', loginUser);

// Get current user info (protected route)
router.get('/me', authenticate, getCurrentUser);

// // Optional: Admin-only routes
// router.get('/all-users', authenticate, isAdmin, getAllUsers);

// // Optional: Staff-only routes
// router.get('/staff-dashboard', authenticate, isStaff, getStaffDashboard);

module.exports = router;