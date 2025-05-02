"use client"

import { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_URL = "http://localhost:3000/api"

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    identifier: "admin@example.com", // Default to admin email
    password: "admin123", // Default to admin password
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.identifier || !formData.password) {
      setError("Username/Email and password are required")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Attempting login with:", {
        identifier: formData.identifier,
        password: formData.password,
      })

      // Try login with username
      let response
      try {
        response = await axios.post(`${API_URL}/users/login`, {
          username: formData.identifier,
          password: formData.password,
        })
        console.log("Login successful with username")
      } catch (usernameError) {
        console.log("Username login failed, trying email")
        // If username login fails, try with email
        try {
          response = await axios.post(`${API_URL}/users/login`, {
            email: formData.identifier,
            password: formData.password,
          })
          console.log("Login successful with email")
        } catch (emailError) {
          console.error("Email login failed:", emailError.response?.data || emailError.message)
          throw emailError
        }
      }

      const { token } = response.data
      console.log("Received token:", token)

      // Store token in localStorage
      localStorage.setItem("token", token)

      // Get user info
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: {
          "x-auth-token": token,
        },
      })

      const user = userResponse.data
      console.log("User info:", user)

      // Check if user is admin
      if (user.role !== "admin") {
        setError("Access denied. Admin privileges required.")
        localStorage.removeItem("token")
        return
      }

      // Store user info
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Redirect to admin dashboard
      navigate("/admin/dashboard")
    } catch (err) {
      console.error("Login error:", err)
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and make sure the server is running.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <VStack spacing={6}>
        <Heading as="h1" size="xl">
          Admin Login
        </Heading>
        <Text>Enter your credentials to access the admin dashboard</Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Username or Email</FormLabel>
              <Input
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter your username or email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Logging in"
              width="full"
              mt={4}
            >
              Login
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

export default AdminLogin
