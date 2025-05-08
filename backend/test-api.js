// scripts/test-api.js
require("dotenv").config()
const axios = require("axios")
const bcrypt = require("bcryptjs")

const API_URL = "http://localhost:3000/api"

async function testAPI() {
  try {
    console.log("Testing API endpoints...")

    // Test database connection
    console.log("\n1. Testing database connection...")
    try {
      const dbResponse = await axios.get(`${API_URL}/debug/postgres`)
      console.log("Database connection:", dbResponse.data)
    } catch (error) {
      console.error("Database connection error:", error.response?.data || error.message)
    }

    // Test login
    console.log("\n2. Testing admin login...")
    let token
    try {
      const loginResponse = await axios.post(`${API_URL}/users/login`, {
        username: "admin",
        password: "admin123",
      })
      token = loginResponse.data.token
      console.log("Login successful, token received")
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message)
    }

    // Test get current user
    if (token) {
      console.log("\n3. Testing get current user...")
      try {
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            "x-auth-token": token,
          },
        })
        console.log("Current user:", userResponse.data)
      } catch (error) {
        console.error("Get user error:", error.response?.data || error.message)
      }
    }

    // Test get orders
    console.log("\n4. Testing get orders...")
    try {
      const ordersResponse = await axios.get(`${API_URL}/orders`)
      console.log("Orders:", ordersResponse.data)
    } catch (error) {
      console.error("Get orders error:", error.response?.data || error.message)
    }

    // Test get menu
    console.log("\n5. Testing get menu...")
    try {
      const menuResponse = await axios.get(`${API_URL}/menu`)
      console.log("Menu items:", menuResponse.data)
    } catch (error) {
      console.error("Get menu error:", error.response?.data || error.message)
    }

    console.log("\nAPI testing completed!")
  } catch (error) {
    console.error("Test failed:", error)
  }
}

testAPI()
