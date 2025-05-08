// index.js
require('dns').setDefaultResultOrder('ipv4first');
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectMongoDB = require("./config/mongo")
const { pool } = require("./config/postgres")

// Import routes
const menuRoutes = require("./routes/menu")
const orderRoutes = require("./routes/orderRoutes")
const orderItemsRoutes = require("./routes/orderItemsRoutes")
const userRoutes = require("./routes/userRoutes")
// const debugRoutes = require("./routes/debug")
const adminRoutes = require("./routes/adminRoutes") // Add admin routes
const debugRoutes = require('./routes/debug-routes');

// Connect to MongoDB
connectMongoDB()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000


const corsOptions = {
  origin: process.env.FRONTEND_URL, // Frontend URL
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions)); // Enable CORS with the frontend URL
// Middleware
app.use(cors())
// app.use(bodyParser.json());
app.use(express.json())

// Root route
app.get("/", (req, res) => {
  res.send("Digital Diner API is running...")
})

// Routes
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/order-items", orderItemsRoutes)
app.use("/api/users", userRoutes)
// app.use("/api/debug", debugRoutes)
app.use("/api/admin", adminRoutes) // Add admin routes
app.use('/api/debug', debugRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
})
