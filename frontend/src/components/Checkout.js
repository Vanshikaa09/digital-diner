"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Divider,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"
import { useCart } from "../hooks/useCart"
import { useToast } from "../hooks/use-toast"
import { createOrder } from "../api"

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pickupTime: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    const { name, email, phone } = formData
    if (!name || !email || !phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Prepare order data
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_address: formData.address,
        total_amount: totalPrice,
        status: "pending",
        pickup_time: formData.pickupTime || new Date().toISOString(),
        items: items.map((item) => ({
          menu_item_id: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }

      console.log("Submitting order:", orderData)

      // Create order
      const newOrder = await createOrder(orderData)
      console.log("Order created:", newOrder)

      // Set order ID for reference
      setOrderId(newOrder.id || "unknown")
      setOrderPlaced(true)

      // Show success modal
      onOpen()

      // Clear cart
      clearCart()
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewOrders = () => {
    navigate("/orders")
    onClose()
  }

  // Helper function to safely format currency
  const formatCurrency = (amount) => {
    // Convert to number if it's a string, or default to 0 if null/undefined
    const numAmount = amount !== null && amount !== undefined ? Number(amount) : 0

    // Check if it's a valid number
    if (isNaN(numAmount)) {
      console.warn("Invalid amount value:", amount)
      return "0.00"
    }

    return numAmount.toFixed(2)
  }

  // Redirect to menu if cart is empty
  if (items.length === 0 && !orderPlaced) {
    return (
      <Box p={4} textAlign="center">
        <Alert status="warning" mb={4}>
          <AlertIcon />
          Your cart is empty. Please add items before checking out.
        </Alert>
        <Button colorScheme="blue" onClick={() => navigate("/")}>
          Browse Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box p={4} maxW="800px" mx="auto">
      <Heading as="h1" mb={6}>
        Checkout
      </Heading>

      <Flex direction={{ base: "column", md: "row" }} gap={8}>
        <Box flex="1">
          <Heading as="h2" size="md" mb={4}>
            Order Summary
          </Heading>
          <VStack align="stretch" spacing={2} mb={4}>
            {items.map((item) => (
              <Flex key={item.menuItemId} justify="space-between">
                <Text>
                  {item.name} x {item.quantity}
                </Text>
                <Text fontWeight="medium">Rs.{formatCurrency(item.price * item.quantity)}</Text>
              </Flex>
            ))}
            <Divider my={2} />
            <Flex justify="space-between" fontWeight="bold">
              <Text>Total:</Text>
              <Text>Rs.{formatCurrency(totalPrice)}</Text>
            </Flex>
          </VStack>
        </Box>

        <Box flex="1.5">
          <Heading as="h2" size="md" mb={4}>
            Customer Information
          </Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address (optional)</FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pickup Time (optional)</FormLabel>
                <Input name="pickupTime" type="datetime-local" value={formData.pickupTime} onChange={handleChange} />
              </FormControl>

              <Box pt={4}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Processing"
                >
                  Place Order
                </Button>
              </Box>
            </VStack>
          </form>
        </Box>
      </Flex>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Placed Successfully!</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Thank you for your order!</Text>
            <Text mt={2}>
              Your order ID is: <strong>{orderId}</strong>
            </Text>
            <Text mt={4}>You can track your order status in the Orders section.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleViewOrders}>
              View My Orders
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Back to Menu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Checkout
