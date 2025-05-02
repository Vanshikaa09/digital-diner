// index.js
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
const debugRoutes = require("./routes/debug")
const adminRoutes = require("./routes/adminRoutes") // Add admin routes

// Connect to MongoDB
connectMongoDB()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

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
app.use("/api/debug", debugRoutes)
app.use("/api/admin", adminRoutes) // Add admin routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
})
// // index.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectMongoDB = require('./config/mongo');
// const { pool } = require('./config/postgres');

// // Import routes
// const menuRoutes = require('./routes/menu');
// const orderRoutes = require('./routes/orderRoutes');
// const orderItemsRoutes = require('./routes/orderItemsRoutes');
// const userRoutes = require('./routes/userRoutes');

// // Connect to MongoDB
// connectMongoDB();

// // Initialize Express app
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// // app.use(bodyParser.json());
// app.use(express.json());


// // Root route
// app.get('/', (req, res) => {
//   res.send('Digital Diner API is running...');
// });

// // Routes
// app.use('/api/menu', menuRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/order-items', orderItemsRoutes);
// app.use('/api/users', userRoutes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('Unhandled Promise Rejection:', err);
// });


// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const connectMongoDB = require('./config/mongo');
// const pgPool = require('./config/postgres');
// const menuRoutes = require("./routes/menu");
// const orderRoutes = require("./routes/orderRoutes");
// const orderItemsRoutes=  require("./routes/orderItemsRoutes")




// connectMongoDB();


// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Sample route
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });
// app.use("/api/menu",menuRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/order_items', orderItemsRoutes);
// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
