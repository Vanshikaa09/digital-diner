// controllers/userController.js
const { query } = require("../config/postgres")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Add validation to check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" })
    }

    const { username, email, password, role } = req.body

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" })
    }

    // Check if user already exists
    const userExists = await query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email])

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user into database
    const result = await query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
      [username, email, hashedPassword, role || "customer"],
    )

    // Create JWT token
    const payload = {
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
    }

    jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1d" }, (err, token) => {
      if (err) throw err
      res.status(201).json({ token })
    })
  } catch (err) {
    console.error("Register error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Login a user
const loginUser = async (req, res) => {
  try {
    console.log("Login request body:", req.body)

    // Add validation to check if req.body exists
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" })
    }

    const { username, email, password } = req.body

    // Validate required fields
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Username/email and password are required" })
    }

    // Check if user exists by username or email
    let result
    if (username) {
      console.log("Looking up user by username:", username)
      result = await query("SELECT * FROM users WHERE username = $1", [username])
    } else {
      console.log("Looking up user by email:", email)
      result = await query("SELECT * FROM users WHERE email = $1", [email])
    }

    console.log("User lookup result:", result.rows.length > 0 ? "User found" : "User not found")

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const user = result.rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    console.log("Password match:", isMatch)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    }

    const secret = process.env.JWT_SECRET || "your-secret-key"
    console.log("Using JWT secret:", secret ? "Secret is set" : "Secret is NOT set")

    jwt.sign(payload, secret, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        console.error("JWT sign error:", err)
        throw err
      }
      console.log("JWT token generated successfully")
      res.json({ token })
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: err.message })
  }
}

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    console.log("Get current user request:", req.user)

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const result = await query("SELECT id, username, email, role FROM users WHERE id = $1", [req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("Current user found:", result.rows[0])
    res.json(result.rows[0])
  } catch (err) {
    console.error("Get current user error:", err)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { registerUser, loginUser, getCurrentUser }
