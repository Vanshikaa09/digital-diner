// middleware/auth.js
const jwt = require("jsonwebtoken")

// Middleware to check if the user is authenticated
const authenticate = (req, res, next) => {
  try {
    console.log("Authenticating request...")

    // Get token from header
    const token = req.header("x-auth-token")
    console.log("Token provided:", token ? "Yes" : "No")

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "your-secret-key"
    console.log("Using JWT secret:", secret ? "Secret is set" : "Secret is NOT set")

    const decoded = jwt.verify(token, secret)
    console.log("Token verified, user:", decoded.user)

    // Add user from payload
    req.user = decoded.user
    next()
  } catch (err) {
    console.error("Authentication error:", err)
    res.status(401).json({ message: "Token is not valid" })
  }
}

// Check user role is admin
const isAdmin = (req, res, next) => {
  console.log("Checking admin role:", req.user)

  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted")
    next()
  } else {
    console.log("Admin access denied")
    res.status(403).json({ message: "Access denied: Admin privileges required" })
  }
}

// Check user role is staff or admin
const isStaff = (req, res, next) => {
  console.log("Checking staff role:", req.user)

  if (req.user && (req.user.role === "staff" || req.user.role === "admin")) {
    console.log("Staff access granted")
    next()
  } else {
    console.log("Staff access denied")
    res.status(403).json({ message: "Access denied: Staff privileges required" })
  }
}

module.exports = { authenticate, isAdmin, isStaff }
